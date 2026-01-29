/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, FormEvent, useMemo, useCallback } from "react";
import CmsNavigationSubmenuProps from "../../../components/navigation/CmsNavigationSubmenu";
import {
  Modal,
  Button,
  Form,
  Table,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
  ButtonGroup, // Importado ButtonGroup para agrupar os botões
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cm, Equipamento, EquipamentoStatus } from "../../../../types";

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [cms, setCms] = useState<Cm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false); // Renomeado para showModal para consistência
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cmId, setCmId] = useState("");
  // Estado para o status do equipamento no formulário
  const [status, setStatus] = useState<EquipamentoStatus>(
    EquipamentoStatus.OPERACIONAL
  );

  // Estados para o modal de confirmação de exclusão
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [equipamentoToDelete, setEquipamentoToDelete] =
    useState<Equipamento | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Função para buscar equipamentos
  const fetchEquipamentos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cmsApi/maquinas");
      if (!res.ok) {
        const errorBody = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        console.error("Erro HTTP ao buscar maquinas:", res.status, errorBody);
        setError(
          `Falha ao carregar maquinas: ${res.status} - ${
            errorBody.message || "Erro desconhecido."
          }`
        );
        setEquipamentos([]);
        return;
      }
      const data: Equipamento[] = await res.json();
      // Garante que o status tenha um valor padrão ao carregar
      const processedData = data.map((eq) => ({
        ...eq,
        status: eq.status || EquipamentoStatus.DESCONHECIDO,
      }));
      setEquipamentos(processedData);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar equipamentos (parsing JSON ou rede):", err);
      setError(
        `Erro ao processar dados de equipamentos: ${err.message}. Verifique sua conexão.`
      );
      setEquipamentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar CMs
  const fetchCms = useCallback(async () => {
    try {
      const res = await fetch("/api/cmsApi/cms");
      if (!res.ok) {
        const errorBody = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        console.error("Erro HTTP ao buscar CMs:", res.status, errorBody);
        setError(
          `Falha ao carregar CMs: ${res.status} - ${
            errorBody.message || "Erro desconhecido."
          }`
        );
        setCms([]);
        return;
      }
      const response = await res.json();

      // Check if response has the standardized format { success: true, data: [...] }
      let data: Cm[];
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success
      ) {
        data = response.data || [];
      } else if (Array.isArray(response)) {
        // Legacy format - direct array
        data = response;
      } else {
        console.error("Formato de resposta inesperado:", response);
        data = [];
      }

      setCms(data);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar CMs (parsing JSON ou rede):", err);
      setError(
        `Erro ao processar dados de CMs: ${err.message}. Verifique sua conexão.`
      );
      setCms([]);
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCms(), fetchEquipamentos()]);
      } catch (err) {
        console.error("Erro na inicialização da página de equipamentos:", err);
        setError(
          "Não foi possível carregar os dados iniciais. Tente recarregar a página."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchCms, fetchEquipamentos]);

  // Função para lidar com o envio do formulário (criação/edição)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `/api/cmsApi/maquinas/${editId}`
      : `/api/cmsApi/maquinas`;

    const payload = {
      nome,
      descricao: descricao || null, // Envia null se a descrição for vazia
      cmId,
      status,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          `Máquina ${editMode ? "atualizado" : "adicionado"} com sucesso!`
        );
        await fetchEquipamentos(); // Recarrega a lista de equipamentos
        fecharModal(); // Fecha e reseta o modal
      } else {
        const errorBody = await res
          .json()
          .catch(() => ({ message: res.statusText }));
        console.error("Erro ao salvar máquina:", res.status, errorBody);
        setError(
          `Erro ao salvar máquina: ${res.status} - ${
            errorBody.message || "Erro desconhecido."
          }`
        );
        toast.error(
          `Erro ao salvar máquina: ${errorBody.message || "Erro desconhecido."}`
        );
      }
    } catch (err: any) {
      console.error("Erro na requisição de salvar/atualizar máquina:", err);
      setError(
        `Erro de rede ao salvar máquina: ${err.message}. Verifique sua conexão.`
      );
      toast.error(`Erro de rede: ${err.message || "Verifique sua conexão."}`);
    }
  };

  // Função para abrir o modal de adição
  const abrirModalAdicao = useCallback(() => {
    // Verificar se as CMs estão carregadas
    if (cms.length === 0) {
      toast.warning(
        "Aguarde o carregamento das Casas de Máquinas ou cadastre uma CM primeiro."
      );
      return;
    }
    setEditMode(false);
    setEditId(null);
    setNome("");
    setDescricao("");
    setCmId("");
    setStatus(EquipamentoStatus.OPERACIONAL); // Reset para o valor padrão
    setShowModal(true);
    setError(null); // Limpa erros anteriores
  }, [cms.length]);

  // Função para abrir o modal de edição
  const abrirModalEdicao = useCallback(
    (eq: Equipamento) => {
      // Verificar se as CMs estão carregadas
      if (cms.length === 0) {
        toast.warning(
          "Aguarde o carregamento das Casas de Máquinas antes de editar."
        );
        return;
      }
      setEditMode(true);
      setEditId(eq.id);
      setNome(eq.nome);
      setDescricao(eq.descricao || "");
      setCmId(eq.cmId);
      // Define o status ao abrir o modal de edição, com fallback
      setStatus(eq.status || EquipamentoStatus.DESCONHECIDO);
      setShowModal(true);
      setError(null); // Limpa erros anteriores
    },
    [cms.length]
  );

  // Funções para o modal de confirmação de exclusão
  const handleShowConfirmModal = useCallback((equipamento: Equipamento) => {
    setEquipamentoToDelete(equipamento);
    setShowConfirmModal(true);
  }, []);

  const handleCloseConfirmModal = useCallback(() => {
    setEquipamentoToDelete(null);
    setShowConfirmModal(false);
  }, []);

  // Função para confirmar a exclusão
  const confirmDelete = async () => {
    if (equipamentoToDelete) {
      try {
        const res = await fetch(
          `/api/cmsApi/maquinas/${equipamentoToDelete.id}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          // Response is successful, proceed with deletion success handling
          // We don't need to parse the response data since we just show success message

          toast.success(
            `Máquina "${equipamentoToDelete.nome}" excluída com sucesso!`
          );
          setEquipamentos((prev) =>
            prev.filter((eq) => eq.id !== equipamentoToDelete.id)
          );
          setError(null);
        } else {
          // Handle error responses
          let errorMessage;
          try {
            const errorData = await res.json();
            errorMessage =
              errorData.message || errorData.error || res.statusText;
          } catch {
            errorMessage = (await res.text()) || res.statusText;
          }

          console.error("Erro ao deletar máquina:", res.status, errorMessage);
          setError(`Erro ao deletar máquina: ${res.status} - ${errorMessage}`);
          toast.error(
            `Erro ao deletar máquina: ${errorMessage || "Erro desconhecido."}`
          );
        }
      } catch (err: any) {
        console.error("Erro ao deletar máquina (rede ou inesperado):", err);
        setError(
          `Erro de rede ao deletar máquina: ${err.message}. Verifique sua conexão.`
        );
        toast.error(`Erro de rede: ${err.message || "Verifique sua conexão."}`);
      } finally {
        handleCloseConfirmModal(); // Fecha o modal de confirmação
      }
    }
  };

  // Função para fechar e resetar o modal
  const fecharModal = useCallback(() => {
    setShowModal(false);
    setEditMode(false);
    setEditId(null);
    setNome("");
    setDescricao("");
    setCmId("");
    setStatus(EquipamentoStatus.OPERACIONAL); // Reset para o valor padrão
    setError(null); // Limpa erros do formulário
  }, []);

  // Lógica de busca e ordenação usando useMemo
  const equipamentosFiltrados = useMemo(() => {
    let filtered = equipamentos;

    // Filtrar por termo de busca (CMs ou máquinas)
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      filtered = filtered.filter((equipamento) => {
        // Buscar no nome da máquina
        const machineNameMatch = equipamento.nome
          .toLowerCase()
          .includes(termLower);
        // Buscar na descrição da máquina
        const machineDescMatch =
          equipamento.descricao?.toLowerCase().includes(termLower) || false;
        // Buscar no nome da CM
        const cmNameMatch =
          equipamento.cm?.nome?.toLowerCase().includes(termLower) || false;
        // Buscar na localização da CM
        const cmLocationMatch =
          equipamento.cm?.localizacao?.toLowerCase().includes(termLower) ||
          false;

        return (
          machineNameMatch || machineDescMatch || cmNameMatch || cmLocationMatch
        );
      });
    }

    return [...(filtered || [])].sort((a, b) => {
      const cmLocationA = a.cm?.localizacao || "";
      const cmLocationB = b.cm?.localizacao || "";
      const cmLocationComparison = cmLocationA.localeCompare(cmLocationB);

      if (cmLocationComparison !== 0) {
        return cmLocationComparison;
      }

      const cmNameA = a.cm?.nome || "";
      const cmNameB = b.cm?.nome || "";
      return cmNameA.localeCompare(cmNameB);
    });
  }, [equipamentos, searchTerm]);

  // Função para obter a classe de cor Bootstrap com base no status do equipamento
  const getStatusColorClass = (status: EquipamentoStatus) => {
    switch (status) {
      case EquipamentoStatus.OPERACIONAL:
        return "text-success"; // Verde
      case EquipamentoStatus.DEFEITO:
        return "text-danger"; // Vermelho
      case EquipamentoStatus.MANUTENCAO:
        return "text-warning"; // Amarelo
      case EquipamentoStatus.DESATIVADO:
        return "text-danger"; // Vermelho (para desativado também)
      case EquipamentoStatus.DESCONHECIDO:
        return "text-muted"; // Cinza
      default:
        return ""; // Sem cor específica
    }
  };

  return (
    <div className="container">
      <CmsNavigationSubmenuProps isCollapsed={false} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
        <h1 className="text-primary">Gerenciamento de Máquinas</h1>
        <Button variant="success" onClick={abrirModalAdicao}>
          + Adicionar Máquina
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Seção de Busca */}
      <Card className="mb-4 shadow">
        <Card.Body>
          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Buscar Máquinas ou Casas de Máquinas:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome da máquina, descrição, nome da CM ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Form.Text className="text-muted"></Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p className="mt-2 text-muted">Carregando equipamentos e CMs...</p>
        </div>
      ) : equipamentosFiltrados.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum equipamento encontrado com o termo de busca aplicado. Adicione
          um novo ou ajuste a busca!
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="bg-primary text-white">
            {/* CORREÇÃO: Removido espaços em branco entre <tr> e <th> para evitar Hydration Error */}
            <tr>
              <th>#</th>
              <th>Máquinas</th>
              <th>Descrição</th>
              <th>Casa de Máquinas</th>
              <th>Piso</th>
              <th className="text-center">Status</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentosFiltrados.map((eq, index) => (
              <tr key={eq.id}>
                <td>{index + 1}</td>
                <td>{eq.nome}</td>
                <td>{eq.descricao || "-"}</td>
                <td>{eq.cm?.nome || "N/A"}</td>
                <td>{eq.cm?.localizacao || "N/A"}</td>
                <td className="text-center">
                  {" "}
                  {/* Centraliza o conteúdo da célula de status */}
                  {(() => {
                    switch (eq.status) {
                      case EquipamentoStatus.OPERACIONAL:
                        return (
                          <span className="text-success">Operacional</span>
                        );
                      case EquipamentoStatus.DEFEITO:
                        return <span className="text-danger">Defeito</span>;
                      case EquipamentoStatus.MANUTENCAO:
                        return <span className="text-warning">Manutenção</span>;
                      case EquipamentoStatus.DESATIVADO:
                        return <span className="text-danger">Desativado</span>;
                      case EquipamentoStatus.DESCONHECIDO:
                        return <span className="text-muted">Desconhecido</span>;
                      default:
                        return <span className="text-muted">N/A</span>;
                    }
                  })()}
                </td>
                <td className="text-center">
                  {/* Usa ButtonGroup para agrupar e alinhar os botões */}
                  <ButtonGroup size="sm">
                    <Button
                      variant="outline-primary"
                      onClick={() => abrirModalEdicao(eq)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleShowConfirmModal(eq)} // Usa o novo handler
                    >
                      🗑️ Excluir
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de Adição/Edição */}
      <Modal show={showModal} onHide={fecharModal} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            {editMode ? "Editar Equipamento" : "Novo Equipamento"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="nome">
              <Form.Label>Máquinas</Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="descricao">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o equipamento..."
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cm">
              <Form.Label>Casa de Máquinas</Form.Label>
              <Form.Select
                value={cmId}
                onChange={(e) => setCmId(e.target.value)}
                required
              >
                <option value="">Selecione uma CM</option>
                {cms.length > 0 ? (
                  cms.map((cm) => (
                    <option key={cm.id} value={cm.id}>
                      {cm.nome} — {cm.localizacao}
                    </option>
                  ))
                ) : (
                  <option disabled>Carregando CMs...</option>
                )}
              </Form.Select>
              {cms.length === 0 && (
                <Form.Text className="text-muted">
                  {loading
                    ? "Carregando CMs..."
                    : "Não há CMs cadastradas. Por favor, adicione Centrais de Monitoramento primeiro."}
                  <br />
                  {!loading && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        fetchCms();
                      }}
                      className="p-0 text-decoration-underline mt-1"
                    >
                      Tentar recarregar CMs
                    </Button>
                  )}
                </Form.Text>
              )}
            </Form.Group>
            {/* Campo de seleção de Status com cor dinâmica */}
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipamentoStatus)}
                required
                className={getStatusColorClass(status)} // Aplica a classe de cor ao select
              >
                {Object.values(EquipamentoStatus).map((s) => (
                  <option key={s} value={s} className={getStatusColorClass(s)}>
                    {" "}
                    {/* Aplica a classe de cor às opções */}
                    {s.charAt(0).toUpperCase() +
                      s.slice(1).toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? "Salvar Alterações" : "Salvar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza de que deseja excluir o equipamento{" "}
          <strong>{equipamentoToDelete?.nome}</strong> da CM{" "}
          <strong>{equipamentoToDelete?.cm?.nome || "N/A"}</strong>? Esta ação é
          irreversível e não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir Permanentemente
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
