"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Form, Alert, Modal } from "react-bootstrap";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Colaborador } from "@/types";

interface OcorrenciaData {
  descricao: string;
  solucao: string;
  colaborador: string;
  status?: "ANDAMENTO" | "CONCLUIDO"; // Add status field
}

interface OcorrenciaProps {
  onRegister?: (data: OcorrenciaData) => void;
}

const Ocorrencia: React.FC<OcorrenciaProps> = ({ onRegister }) => {
  const [descricao, setDescricao] = useState("");
  const [solucao, setSolucao] = useState("");
  const [colaborador, setColaborador] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showColaboradorModal, setShowColaboradorModal] = useState(false);
  const [newColaborador, setNewColaborador] = useState({
    nome: "",
    funcao: "",
  });
  const [newColaboradorError, setNewColaboradorError] = useState<string | null>(
    null
  );
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false); // Add mobile detection

  // Single speech recognition hook for all fields
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const supported = browserSupportsSpeechRecognition !== false;

  // Track which field is currently being listened to
  const [activeField, setActiveField] = useState<
    "descricao" | "solucao" | "colaborador" | null
  >(null);

  // Detect if user is on mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
      const mobile = /android|ipad|iphone|ipod/i.test(userAgent);
      setIsMobile(mobile);
    }
  }, []);

  // Fetch colaboradores
  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/colaboradores");
      if (!response.ok) {
        throw new Error("Falha ao carregar colaboradores");
      }
      const result = await response.json();
      console.log("API Response:", result); // Debug: Log the API response

      // Handle the nested data structure from the API
      let colaboradoresData: Colaborador[] = [];
      if (result && result.data) {
        if (Array.isArray(result.data)) {
          // Direct array format
          colaboradoresData = result.data;
        } else if (result.data.data && Array.isArray(result.data.data)) {
          // Nested data format (data.data)
          colaboradoresData = result.data.data;
        }
      }

      console.log("Colaboradores Data:", colaboradoresData); // Debug: Log the processed data
      setColaboradores(colaboradoresData);
    } catch (err) {
      console.error("Erro ao buscar colaboradores:", err); // Debug: Log any errors
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      // Set empty array on error to prevent rendering issues
      setColaboradores([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch colaboradores on component mount
  useEffect(() => {
    fetchColaboradores();
  }, []);

  // Debug: Log colaboradores when they change
  useEffect(() => {
    console.log("Colaboradores atualizados:", colaboradores);
  }, [colaboradores]);

  // Debug: Log when rendering the select
  useEffect(() => {
    console.log("Rendering colaboradores in select:", colaboradores);
  }, [colaboradores]);

  // Update the active field when transcript changes
  useEffect(() => {
    if (transcript && activeField) {
      // For mobile devices, we might want to handle interim results differently
      // Only update on final results to avoid flickering
      switch (activeField) {
        case "descricao":
          setDescricao(transcript);
          break;
        case "solucao":
          setSolucao(transcript);
          break;
        case "colaborador":
          setColaborador(transcript);
          break;
      }
    }
  }, [transcript, activeField]);

  const handleStartListening = async (
    field: "descricao" | "solucao" | "colaborador"
  ) => {
    // Clear any previous speech errors
    setSpeechError(null);

    // Check if browser supports speech recognition
    if (!supported) {
      setSpeechError("Seu navegador não suporta reconhecimento de voz. Tente usar Chrome ou Safari.");
      return;
    }

    // Additional checks for mobile devices
    if (isMobile) {
      // Check if we're on HTTPS (required for mobile)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setSpeechError("Em dispositivos móveis, o reconhecimento de voz requer uma conexão segura (HTTPS).");
        return;
      }
    }

    // Check if microphone is available
    if (!isMicrophoneAvailable) {
      setSpeechError("Microfone não disponível. Verifique as permissões do seu dispositivo.");
      return;
    }

    // Stop any active listening first
    SpeechRecognition.stopListening();
    // Reset transcript and start listening for the specified field
    resetTranscript();
    setActiveField(field);

    try {
      // For mobile devices, we might need to handle this differently
      if (isMobile) {
        // On mobile, we might want to show a user prompt
        setSpeechError(null); // Clear any previous errors
      }

      // Add a small delay to ensure proper initialization on mobile
      if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      SpeechRecognition.startListening({ continuous: true, language: "pt-BR" });
    } catch (err) {
      console.error("Speech recognition error:", err);
      setSpeechError("Erro ao iniciar reconhecimento de voz. Tente novamente.");

      // Additional mobile-specific error handling
      if (isMobile) {
        setSpeechError("Erro ao iniciar reconhecimento de voz. Em dispositivos móveis, certifique-se de que o navegador tem permissão para acessar o microfone e tente novamente.");
      }
    }
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    setActiveField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!descricao.trim() || !solucao.trim() || !colaborador.trim()) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    try {
      // Send data to API
      const response = await fetch("/api/ocorrencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descricao, solucao, colaborador }),
      });

      if (!response.ok) {
        throw new Error("Falha ao registrar ocorrência");
      }

      await response.json();

      // Call the onRegister callback if provided
      if (onRegister) {
        onRegister({ descricao, solucao, colaborador, status: "ANDAMENTO" });
      }

      // Reset form
      setDescricao("");
      setSolucao("");
      setColaborador("");
      resetTranscript();
      setActiveField(null);
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao registrar ocorrência"
      );
    }
  };

  const handleAddColaborador = async () => {
    if (!newColaborador.nome.trim() || !newColaborador.funcao.trim()) {
      setNewColaboradorError("Nome e função são obrigatórios");
      return;
    }

    try {
      const response = await fetch("/api/colaboradores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newColaborador),
      });

      if (!response.ok) {
        throw new Error("Falha ao adicionar colaborador");
      }

      const result = await response.json();
      // Ensure we're working with the correct data structure
      if (result && result.data) {
        setColaboradores([...colaboradores, result.data]);
        setColaborador(result.data.nome);
      }
      setShowColaboradorModal(false);
      setNewColaborador({ nome: "", funcao: "" });
      setNewColaboradorError(null);
    } catch (err) {
      setNewColaboradorError(
        err instanceof Error ? err.message : "Erro ao adicionar colaborador"
      );
    }
  };

  // Function to check if a field is currently listening
  const isFieldListening = (field: "descricao" | "solucao" | "colaborador") => {
    return listening && activeField === field;
  };

  // Add effect to handle speech recognition errors
  useEffect(() => {
    if (!supported) {
      setSpeechError("Seu navegador não suporta reconhecimento de voz");
    }
  }, [supported]);

  // Add a specific handler for speech recognition errors
  useEffect(() => {
    // This will handle errors that occur during speech recognition
    const handleSpeechError = (event: { error: string }) => {
      console.error("Speech recognition error event:", event);
      if (event.error === 'not-allowed') {
        setSpeechError("Permissão para acessar o microfone negada. Por favor, permita o acesso ao microfone nas configurações do seu navegador.");
      } else if (event.error === 'no-speech') {
        setSpeechError("Nenhuma fala detectada. Por favor, tente falar mais alto ou claramente.");
      } else if (event.error === 'audio-capture') {
        setSpeechError("Erro ao acessar o microfone. Verifique se o dispositivo está conectado e funcionando.");
      } else if (event.error === 'network') {
        setSpeechError("Erro de rede. Verifique sua conexão e tente novamente.");
      } else {
        setSpeechError(`Erro de reconhecimento de voz: ${event.error}`);
      }

      // Reset active field on error
      setActiveField(null);
    };

    // We need to access the underlying recognition object to handle errors
    const recognition = SpeechRecognition.getRecognition();
    if (recognition) {
      recognition.onerror = handleSpeechError;

      // Also handle the end event to reset active field
      recognition.onend = () => {
        setActiveField(null);
      };
    }

    // Cleanup function
    return () => {
      if (recognition) {
        recognition.onerror = null;
        recognition.onend = null;
      }
    };
  }, [listening]); // Re-attach error handler when listening state changes

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow mb-4">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-mic me-2"></i>
          Registro de Ocorrências
        </h5>
      </Card.Header>
      <Card.Body>
        {success && (
          <Alert variant="success" className="mb-3">
            <i className="bi bi-check-circle me-2"></i>
            Ocorrência registrada com sucesso!
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {speechError && (
          <Alert variant="warning" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {speechError}
            {isMobile && (
              <div className="mt-2">
                <small>
                  <strong>Dica para dispositivos móveis:</strong> Certifique-se de estar usando
                  Chrome ou Safari, que o site tenha permissão para acessar o microfone,
                  e que esteja acessando via HTTPS (exceto localhost).
                </small>
              </div>
            )}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Descrição Field */}
          <Form.Group className="mb-3">
            <Form.Label>
              Descrição da Ocorrência <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex">
              <Form.Control
                as="textarea"
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva a ocorrência..."
                required
                className="me-2"
              />
              <div className="d-flex flex-column">
                {supported ? (
                  <>
                    <Button
                      variant={
                        isFieldListening("descricao") ? "danger" : "primary"
                      }
                      onClick={
                        isFieldListening("descricao")
                          ? handleStopListening
                          : () => handleStartListening("descricao")
                      }
                      className="mb-2"
                      disabled={!supported || (isMobile && !isMicrophoneAvailable)}
                    >
                      <i
                        className={`bi ${isFieldListening("descricao")
                          ? "bi-mic-mute"
                          : "bi-mic"
                          } me-1`}
                      ></i>
                      {isFieldListening("descricao") ? "Parar" : "Falar"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDescricao("");
                        resetTranscript();
                        if (activeField === "descricao") {
                          setActiveField(null);
                        }
                      }}
                      disabled={!descricao}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Limpar
                    </Button>
                  </>
                ) : (
                  <Alert variant="warning" className="p-2">
                    <small>
                      Seu navegador não suporta reconhecimento de voz
                    </small>
                  </Alert>
                )}
              </div>
            </div>
            {isFieldListening("descricao") && (
              <div className="mt-2">
                <span className="badge bg-success">
                  <i className="bi bi-mic me-1"></i>
                  Ouvindo...
                </span>
                {isMobile && (
                  <div className="mt-1">
                    <small className="text-muted">
                      Falando... Toque no botão &#39;Parar&#39; quando terminar.
                    </small>
                  </div>
                )}
              </div>
            )}
          </Form.Group>

          {/* Solução Field */}
          <Form.Group className="mb-3">
            <Form.Label>
              Solução <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex">
              <Form.Control
                as="textarea"
                rows={3}
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
                placeholder="Descreva a solução..."
                required
                className="me-2"
              />
              <div className="d-flex flex-column">
                {supported ? (
                  <>
                    <Button
                      variant={
                        isFieldListening("solucao") ? "danger" : "primary"
                      }
                      onClick={
                        isFieldListening("solucao")
                          ? handleStopListening
                          : () => handleStartListening("solucao")
                      }
                      className="mb-2"
                      disabled={!supported || (isMobile && !isMicrophoneAvailable)}
                    >
                      <i
                        className={`bi ${isFieldListening("solucao") ? "bi-mic-mute" : "bi-mic"
                          } me-1`}
                      ></i>
                      {isFieldListening("solucao") ? "Parar" : "Falar"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSolucao("");
                        resetTranscript();
                        if (activeField === "solucao") {
                          setActiveField(null);
                        }
                      }}
                      disabled={!solucao}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Limpar
                    </Button>
                  </>
                ) : (
                  <Alert variant="warning" className="p-2">
                    <small>
                      Seu navegador não suporta reconhecimento de voz
                    </small>
                  </Alert>
                )}
              </div>
            </div>
            {isFieldListening("solucao") && (
              <div className="mt-2">
                <span className="badge bg-success">
                  <i className="bi bi-mic me-1"></i>
                  Ouvindo...
                </span>
                {isMobile && (
                  <div className="mt-1">
                    <small className="text-muted">
                      Falando... Toque no botão &#39;Parar&#39; quando terminar.
                    </small>
                  </div>
                )}
              </div>
            )}
          </Form.Group>

          {/* Colaborador Field */}
          <Form.Group className="mb-4">
            <Form.Label>
              Colaborador <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex">
              <Form.Select
                value={colaborador}
                onChange={(e) => setColaborador(e.target.value)}
                required
                className="me-2"
              >
                <option value="">Selecione um colaborador</option>
                {Array.isArray(colaboradores) && colaboradores.length > 0 ? (
                  colaboradores
                    .filter(col => col && col.id) // Filter out any colaboradores without id
                    .map((col) => (
                      <option key={col.id} value={col.nome}>
                        {col.nome} ({col.funcao})
                      </option>
                    ))
                ) : (
                  <option value="" disabled>
                    Nenhum colaborador disponível
                  </option>
                )}
              </Form.Select>
              <Button
                variant="success"
                onClick={() => setShowColaboradorModal(true)}
                className="me-2"
              >
                <i className="bi bi-plus-circle me-1"></i>
                Novo
              </Button>
              <div className="d-flex flex-column">
                <Button
                  variant="outline-secondary"
                  onClick={fetchColaboradores}
                  className="mb-2"
                  title="Atualizar lista de colaboradores"
                >
                  <i className="bi bi-arrow-repeat"></i>
                </Button>
                {supported ? (
                  <Button
                    variant={
                      isFieldListening("colaborador") ? "danger" : "primary"
                    }
                    onClick={
                      isFieldListening("colaborador")
                        ? handleStopListening
                        : () => handleStartListening("colaborador")
                    }
                    disabled={!supported || (isMobile && !isMicrophoneAvailable)}
                  >
                    <i
                      className={`bi ${isFieldListening("colaborador")
                        ? "bi-mic-mute"
                        : "bi-mic"
                        } me-1`}
                    ></i>
                    Falar
                  </Button>
                ) : (
                  <Alert variant="warning" className="p-2">
                    <small>
                      Seu navegador não suporta reconhecimento de voz
                    </small>
                  </Alert>
                )}
              </div>
            </div>
            {isFieldListening("colaborador") && (
              <div className="mt-2">
                <span className="badge bg-success">
                  <i className="bi bi-mic me-1"></i>
                  Ouvindo...
                </span>
                {isMobile && (
                  <div className="mt-1">
                    <small className="text-muted">
                      Falando... Toque no botão &#39;Parar&#39; quando terminar.
                    </small>
                  </div>
                )}
              </div>
            )}
          </Form.Group>

          <div className="d-grid">
            <Button variant="primary" type="submit" size="lg">
              <i className="bi bi-save me-2"></i>
              Registrar Ocorrência
            </Button>
          </div>
        </Form>

        {/* Modal para adicionar novo colaborador */}
        <Modal
          show={showColaboradorModal}
          onHide={() => setShowColaboradorModal(false)}
          centered
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>
              <i className="bi bi-person-plus me-2"></i>
              Adicionar Novo Colaborador
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {newColaboradorError && (
              <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {newColaboradorError}
              </Alert>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Nome <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newColaborador.nome}
                  onChange={(e) =>
                    setNewColaborador({
                      ...newColaborador,
                      nome: e.target.value,
                    })
                  }
                  placeholder="Nome completo"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Função <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newColaborador.funcao}
                  onChange={(e) =>
                    setNewColaborador({
                      ...newColaborador,
                      funcao: e.target.value,
                    })
                  }
                  placeholder="Função do colaborador"
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowColaboradorModal(false);
                setNewColaborador({ nome: "", funcao: "" });
                setNewColaboradorError(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddColaborador}>
              Adicionar
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default Ocorrencia;