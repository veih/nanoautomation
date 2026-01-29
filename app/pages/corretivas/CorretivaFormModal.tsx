/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Modal, Button, Form, Row, Col, Spinner, } from "react-bootstrap";
import Image from "next/image";
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { Corretiva, CorretivasStatus, Colaborador } from "../../../types";

// Local hooks to replace lib/hooks (removed due to infinite callback issues)
function useFetch<T>(url: string, options: { immediate?: boolean } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      // Handle both standardized and legacy response formats
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result
      ) {
        if (!result.success) {
          throw new Error(result.error?.message || "API Error");
        }
        setData(result.data || null);
      } else {
        setData(result);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

function useForm<T>(
  initialValues: T,
  validate?: (values: T) => Record<string, string>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // We'll handle error clearing separately to avoid dependency issues
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setErrorsCallback = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const validationErrors = validate ? validate(values) : {};
        setErrorsCallback(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
          await onSubmit(values);
        }
      };
    },
    [setErrorsCallback, validate, values]
  );

  const validateForm = useCallback(() => {
    const validationErrors = validate ? validate(values) : {};
    setErrorsCallback(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validate, values, setErrorsCallback]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    setValue,
    clearError,
    handleSubmit,
    validateForm,
    reset,
    setErrors: setErrorsCallback,
  };
}

function useAsyncOperation() {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (
      operation: () => Promise<unknown>,
      options: { successMessage?: string; errorMessage?: string } = {}
    ) => {
      setLoading(true);
      try {
        const result = await operation();
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        return result;
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : options.errorMessage || "Erro na operação";
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    execute,
    loading,
  };
}

import { corretivaSchema } from "../../../lib/validations";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

interface Props {
  show: boolean;
  onHide: () => void;
  editData: Corretiva | null;
  colaboradores: Colaborador[];
  onSaved: () => void;
}

const API_CORRETIVAS = "/api/corretivas";

export default function CorretivaFormModal({
  show,
  onHide,
  editData,
  colaboradores: propsColaboradores,
  onSaved,
}: Props) {
  const isEdit = Boolean(editData);
  const { execute: executeOperation, loading } = useAsyncOperation();

  // File handling state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
  const [base64Images, setBase64Images] = useState<string[]>([]); // For base64 images
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Get colaboradores data with fallback
  const { data: colaboradoresResponse } = useFetch<{ data: Colaborador[] }>(
    "/api/colaboradores",
    {
      immediate: !propsColaboradores.length,
    }
  );
  const colaboradores =
    propsColaboradores.length > 0
      ? propsColaboradores
      : colaboradoresResponse?.data || [];

  // Stable initial values
  const initialFormValues = useMemo(
    () => ({
      data: "",
      descricao: "",
      local: "",
      colaborador: "",
      solicitacao: "",
      solicitante: "",
      status: CorretivasStatus.ANDAMENTO,
      sistema: "",
      categoria: "",
      formaCorrecao: "",
    }),
    []
  );

  // Form management with validation
  const {
    values: formValues,
    errors: formErrors,
    handleSubmit,
    setValue,
    clearError,
    reset: resetForm,
  } = useForm(initialFormValues, (values) => {
    // Convert to API format for validation
    const apiValues = {
      ...values,
      data: values.data ? new Date(values.data).toISOString() : "",
      status: values.status as CorretivasStatus,
    };

    const result = corretivaSchema
      .omit({ dataConclusao: true })
      .safeParse(apiValues);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    result.error.issues.forEach((err: any) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return errors;
  });

  // Update setValue to also clear errors
  const setValueWithClearError = useCallback(
    (field: keyof typeof initialFormValues, value: unknown) => {
      setValue(field, value);
      clearError(field as string);
    },
    [setValue, clearError]
  );

  // Initialize form data when editData changes
  useEffect(() => {
    if (editData) {
      // Direct form initialization to avoid dependency issues
      setValue("data", editData.data.split("T")[0]);
      setValue("descricao", editData.descricao);
      setValue("local", editData.local);
      setValue("colaborador", editData.colaborador || "");
      setValue("solicitacao", editData.solicitacao);
      setValue("solicitante", editData.solicitante);
      setValue("status", editData.status);
      setValue("sistema", editData.sistema || "");
      setValue("categoria", editData.categoria || "");
      setValue("formaCorrecao", editData.formaCorrecao || "");
      
      // Clear errors for all fields
      clearError("data");
      clearError("descricao");
      clearError("local");
      clearError("colaborador");
      clearError("solicitacao");
      clearError("solicitante");
      clearError("status");
      clearError("sistema");
      clearError("categoria");
      clearError("formaCorrecao");
      
      setExistingPhotoUrls(editData.fotoUrls || []);
      setRemovedPhotoUrls([]);
      setSelectedFiles([]);
      setBase64Images([]);
    } else {
      resetForm();
      setExistingPhotoUrls([]);
      setRemovedPhotoUrls([]);
      setSelectedFiles([]);
      setBase64Images([]);
    }
  }, [editData, setValue, clearError, resetForm]);

  // Photo preview URLs
  const photoPreviewUrls = useMemo(() => {
    const newUrls = selectedFiles.map((f) => URL.createObjectURL(f));
    const base64Urls = base64Images;
    return [...existingPhotoUrls, ...newUrls, ...base64Urls];
  }, [selectedFiles, existingPhotoUrls, base64Images]);

  // File handling
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const totalFiles =
      existingPhotoUrls.length + selectedFiles.length + newFiles.length + base64Images.length;

    if (totalFiles > 4) {
      toast.warning("Você só pode adicionar até 4 imagens por corretiva.");
      const allowed = 4 - (existingPhotoUrls.length + selectedFiles.length + base64Images.length);
      setSelectedFiles((prev) => [...prev, ...newFiles.slice(0, allowed)]);
    } else {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle camera capture (base64 images)
  const handleCameraCapture = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const totalFiles = existingPhotoUrls.length + selectedFiles.length + base64Images.length + 1;

          if (totalFiles > 4) {
            toast.warning("Você só pode adicionar até 4 imagens por corretiva.");
          } else {
            setBase64Images((prev) => [...prev, event.target?.result as string]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleCameraClick = () => cameraInputRef.current?.click();

  const handleRemoveExistingPhoto = (url: string) => {
    setExistingPhotoUrls((prev) => prev.filter((u) => u !== url));
    setRemovedPhotoUrls((prev) => [...prev, url]);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveBase64Image = (index: number) => {
    setBase64Images((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const onSubmit = handleSubmit(async () => {
    await executeOperation(
      async () => {
        // Upload base64 images first if there are any
        let imagePaths: string[] = [];
        if (base64Images.length > 0) {
          const imageResponse = await fetch("/api/corretivas/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              corretivaId: isEdit ? editData!.id : undefined,
              images: base64Images
            }),
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            throw new Error(errorData.error?.message || "Failed to upload images");
          }

          const imageData = await imageResponse.json();
          imagePaths = imageData.data.imagePaths;
        }

        const dataToSend = new FormData();

        // Add form data - using formValues to ensure all fields are included
        Object.entries(formValues).forEach(([key, value]) => {
          // Always send required fields, even if empty
          const requiredFields = ['descricao', 'local', 'solicitacao', 'solicitante', 'data', 'status'];
          
          if (requiredFields.includes(key)) {
            dataToSend.append(key, value as string);
          } else if (key === 'formaCorrecao') {
            // For formaCorrecao, send empty string as is
            dataToSend.append(key, value as string);
          } else {
            // For other optional fields, filter out empty values
            if (value !== undefined && value !== null && value !== '') {
              dataToSend.append(key, value as string);
            }
          }
        });

        // Add image paths if any
        if (imagePaths.length > 0) {
          imagePaths.forEach((path) => dataToSend.append("imagePaths", path));
        }

        // Add files
        selectedFiles.forEach((file) => dataToSend.append("file", file));
        removedPhotoUrls.forEach((url) =>
          dataToSend.append("removedPhotos", url)
        );

        const url = isEdit
          ? `${API_CORRETIVAS}/${editData?.id}`
          : API_CORRETIVAS;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, { method, body: dataToSend });

        if (!res.ok) {
          let errorMessage = "Erro ao salvar corretiva";

          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorData.message || errorMessage;

            // Add details if available
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
          } catch {
            // If we can't parse the error response, use the status text
            errorMessage = `Erro ${res.status}: ${res.statusText}`;
          }

          throw new Error(errorMessage);
        }

        onSaved();
        onHide();
        return res.json();
      },
      {
        successMessage: isEdit
          ? "Corretiva atualizada com sucesso!"
          : "Corretiva criada com sucesso!",
        errorMessage: "Erro ao salvar corretiva",
      }
    );
  });

  // Complete corretiva
  const handleComplete = async () => {
    if (!editData) return;

    await executeOperation(
      async () => {
        // Upload base64 images first if there are any
        let imagePaths: string[] = [];
        if (base64Images.length > 0) {
          const imageResponse = await fetch("/api/corretivas/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              corretivaId: editData.id,
              images: base64Images
            }),
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            throw new Error(errorData.error?.message || "Failed to upload images");
          }

          const imageData = await imageResponse.json();
          imagePaths = imageData.data.imagePaths;
        }

        const dataToSend = new FormData();

        // Add current form data
        Object.entries(formValues).forEach(([key, value]) => {
          // Always send required fields, even if empty
          const requiredFields = ['descricao', 'local', 'solicitacao', 'solicitante', 'data', 'status'];
          
          if (requiredFields.includes(key)) {
            dataToSend.append(key, value as string);
          } else if (key === 'formaCorrecao') {
            // For formaCorrecao, send empty string as is
            dataToSend.append(key, value as string);
          } else {
            // For other optional fields, filter out empty values
            if (value !== undefined && value !== null && value !== '') {
              dataToSend.append(key, value as string);
            }
          }
        });

        // Override status and add completion date
        dataToSend.set("status", CorretivasStatus.CONCLUIDO);
        dataToSend.append("dataConclusao", new Date().toISOString());

        // Add image paths if any
        if (imagePaths.length > 0) {
          imagePaths.forEach((path) => dataToSend.append("imagePaths", path));
        }

        // Add files
        selectedFiles.forEach((file) => dataToSend.append("file", file));
        removedPhotoUrls.forEach((url) =>
          dataToSend.append("removedPhotos", url)
        );

        const res = await fetch(`${API_CORRETIVAS}/${editData.id}`, {
          method: "PUT",
          body: dataToSend,
        });

        if (!res.ok) {
          let errorMessage = "Falha ao concluir corretiva";

          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorData.message || errorMessage;

            // Add details if available
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
          } catch {
            // If we can't parse the error response, use the status text
            errorMessage = `Erro ${res.status}: ${res.statusText}`;
          }

          throw new Error(errorMessage);
        }

        onSaved();
        onHide();
        return res.json();
      },
      {
        successMessage: "Corretiva concluída com sucesso!",
        errorMessage: "Erro ao concluir corretiva",
      }
    );
  };

  const locais = [
    "CMs",
    "Lojas",
    "Estacionamento",
    "ATs",
    "Sala de Segurança",
    "Subestações",
    "Teatro",
  ];

  const sistemas = [
    "Energia",
    "SCA", 
    "SCP",
    "SDAI",
    "Outros"
  ];

  const categoriasPorSistema: Record<string, string[]> = {
    "Energia": [
      "Gestal",
      "Medidor de energia",
      "Fonte de energia",
      "Rede"
    ],
    "SCA": [
      "Analise de sistema de controle de acesso",
      "Backup",
      "W Acess",
      "Botão de requisição de saida",
      "Cadastro de cartão offline",
      "Cadastro de usuário",
      "Eletroímã",
      "Fixação",
      "Leitora",
      "Rede",
      "Serviço"
    ],
    "SCP": [
      "Sensores de Segurança",
      "Sensores de Automação",
      "Atuador",
      "Inversor de frequencia",
      "Controlador NR",
      "Criar alarme",
      "Falha de acionamento",
      "Iluminação",
      "Programação horária",
      "Rede"
    ],
    "SDAI": [
      "Acionamento manual",
      "Alarme indevido",
      "Backup",
      "Central de incêndio",
      "Chave de fluxo",
      "Detector",
      "Fixação de despositivo",
      "Interligação de loja",
      "Laço em curto ou aberto",
      "Modulo",
      "Nomeclatura de dispositivo",
      "Rebot Buster",
      "Repetidora",
      "Sirene",
      "Teste de acionamento",
      "Valvula solenoide"
    ],
    "Outros": [
      "Manutenção Predial",
      "Infraestrutura TI",
      "Rede/Cabeamento",
      "Equipamentos Diversos",
      "Sistema de Áudio",
      "Controle Ambiental",
      "Outros Equipamentos"
    ]
  };

  return (
    <ComponentErrorBoundary componentName="Formulário de Corretiva">
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i
              className={`bi ${isEdit ? "bi-pencil" : "bi-plus-circle"} me-2`}
            ></i>
            {isEdit ? "Editar Corretiva" : "Nova Corretiva"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={onSubmit} className="form-enhanced">
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="data" className="mb-3">
                  <Form.Label>
                    Data <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formValues.data}
                    onChange={(e) =>
                      setValueWithClearError("data", e.target.value)
                    }
                    isInvalid={!!formErrors.data}
                    required
                  />
                  {formErrors.data && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.data}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="local" className="mb-3">
                  <Form.Label>
                    Local <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formValues.local}
                    onChange={(e) =>
                      setValueWithClearError("local", e.target.value)
                    }
                    isInvalid={!!formErrors.local}
                    required
                  >
                    <option value="">Selecione um local</option>
                    {locais.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </Form.Select>
                  {formErrors.local && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.local}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="sistema" className="mb-3">
                  <Form.Label>Sistema</Form.Label>
                  <Form.Select
                    value={formValues.sistema}
                    onChange={(e) => {
                      setValueWithClearError("sistema", e.target.value);
                      // Limpa a categoria quando muda o sistema
                      setValueWithClearError("categoria", "");
                    }}
                    isInvalid={!!formErrors.sistema}
                  >
                    <option value="">Selecione um sistema</option>
                    {sistemas.map((sistema) => (
                      <option key={sistema} value={sistema}>
                        {sistema}
                      </option>
                    ))}
                  </Form.Select>
                  {formErrors.sistema && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.sistema}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="categoria" className="mb-3">
              <Form.Label>Categoria</Form.Label>
              <Form.Select
                value={formValues.categoria}
                onChange={(e) =>
                  setValueWithClearError("categoria", e.target.value)
                }
                isInvalid={!!formErrors.categoria}
                disabled={!formValues.sistema}
              >
                <option value="">
                  {formValues.sistema 
                    ? "Selecione uma categoria" 
                    : "Selecione primeiro um sistema"}
                </option>
                {formValues.sistema && categoriasPorSistema[formValues.sistema]?.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </Form.Select>
              {formErrors.categoria && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.categoria}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="colaborador" className="mb-3">
              <Form.Label>
                Colaborador <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formValues.colaborador}
                onChange={(e) =>
                  setValueWithClearError("colaborador", e.target.value)
                }
                isInvalid={!!formErrors.colaborador}
                required
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </Form.Select>
              {formErrors.colaborador && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.colaborador}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="solicitante" className="mb-3">
              <Form.Label>
                Solicitante <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formValues.solicitante}
                onChange={(e) =>
                  setValueWithClearError("solicitante", e.target.value)
                }
                isInvalid={!!formErrors.solicitante}
                placeholder="Nome do solicitante"
                required
              />
              {formErrors.solicitante && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.solicitante}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="solicitacao" className="mb-3">
              <Form.Label>
                Solicitação <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formValues.solicitacao}
                onChange={(e) =>
                  setValueWithClearError("solicitacao", e.target.value)
                }
                isInvalid={!!formErrors.solicitacao}
                placeholder="Descreva a solicitação..."
                required
              />
              {formErrors.solicitacao && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.solicitacao}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="descricao" className="mb-3">
              <Form.Label>
                Descrição <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formValues.descricao}
                onChange={(e) =>
                  setValueWithClearError("descricao", e.target.value)
                }
                isInvalid={!!formErrors.descricao}
                placeholder="Descreva detalhadamente o problema..."
                required
              />
              {formErrors.descricao && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.descricao}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="formaCorrecao" className="mb-3">
              <Form.Label>
                Forma de Correção
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formValues.formaCorrecao}
                onChange={(e) =>
                  setValueWithClearError("formaCorrecao", e.target.value)
                }
                isInvalid={!!formErrors.formaCorrecao}
                placeholder="Descreva como a corretiva foi realizada..."
              />
              {formErrors.formaCorrecao && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.formaCorrecao}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="status" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formValues.status}
                onChange={(e) =>
                  setValueWithClearError(
                    "status",
                    e.target.value as CorretivasStatus
                  )
                }
                required
              >
                <option value={CorretivasStatus.ANDAMENTO}>EM ANDAMENTO</option>
                <option value={CorretivasStatus.ESPERA}>EM ESPERA</option>
                <option value={CorretivasStatus.CONCLUIDO}>CONCLUÍDO</option>
              </Form.Select>
            </Form.Group>



            {/* Photo Management */}
            <Form.Group className="mb-3">
              <Form.Label>Fotos da Corretiva</Form.Label>

              {photoPreviewUrls.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {photoPreviewUrls.map((url, i) => (
                    <div key={i} className="position-relative">
                      <Image
                        src={url}
                        alt="Preview"
                        width={120}
                        height={120}
                        style={{ objectFit: "cover" }}
                        className="rounded border shadow-sm"
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        className="position-absolute top-0 end-0 rounded-circle"
                        style={{ width: 24, height: 24, fontSize: "12px" }}
                        onClick={() => {
                          // Determine which array the image belongs to and remove accordingly
                          const existingIndex = existingPhotoUrls.indexOf(url);
                          const selectedIndex = selectedFiles.findIndex((_, idx) => {
                            const previewUrl = URL.createObjectURL(selectedFiles[idx]);
                            return previewUrl === url;
                          });
                          const base64Index = base64Images.indexOf(url);

                          if (existingIndex >= 0) {
                            handleRemoveExistingPhoto(url);
                          } else if (selectedIndex >= 0) {
                            handleRemoveSelectedFile(selectedIndex);
                          } else if (base64Index >= 0) {
                            handleRemoveBase64Image(base64Index);
                          }
                        }}
                        title="Remover foto"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="d-flex flex-column gap-2">
                <div className="d-flex gap-2">
                  {/* Camera capture */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    style={{ display: "none" }}
                    onChange={handleCameraCapture}
                    multiple
                  />
                  <Button
                    variant="primary"
                    onClick={handleCameraClick}
                    className="d-flex align-items-center"
                    disabled={photoPreviewUrls.length >= 4}
                  >
                    <i className="bi bi-camera me-2"></i>
                    Tirar Foto
                  </Button>

                  {/* File selection */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleUploadClick}
                    className="d-flex align-items-center"
                    disabled={photoPreviewUrls.length >= 4}
                  >
                    <i className="bi bi-folder me-2"></i>
                    Selecionar Imagens
                  </Button>
                </div>

                <small className="text-muted">
                  Máximo 4 imagens. Formatos aceitos: JPG, PNG, WEBP
                  {photoPreviewUrls.length > 0 && (
                    <span className="ms-2">({photoPreviewUrls.length}/4)</span>
                  )}
                </small>
              </div>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>

            {isEdit && (
              <Button
                variant="success"
                onClick={handleComplete}
                disabled={loading}
                className="btn-enhanced"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Concluir
                  </>
                )}
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="btn-enhanced"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <i
                    className={`bi ${isEdit ? "bi-check" : "bi-plus"} me-2`}
                  ></i>
                  {isEdit ? "Atualizar" : "Salvar"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </ComponentErrorBoundary>
  );
}
