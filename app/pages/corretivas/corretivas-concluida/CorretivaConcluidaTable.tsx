import { useState, useRef, useEffect } from "react";
import { CorretivaConcluida, Colaborador } from "../../../../types";
import { Modal, Button, Alert, Card, Row, Col } from "react-bootstrap";
import CorretivaConcluidaFormModal from "./CorretivaConcluidaFormModal";
import Image from "next/image";

interface Props {
  corretivas: CorretivaConcluida[];
  onEdit?: (c: CorretivaConcluida) => void;
  onDelete: (c: CorretivaConcluida) => void;
  colaboradores: Colaborador[]; // Add colaboradores prop
  onSaved: () => void; // Add onSaved prop
}

export default function CorretivaConcluidaTable({
  corretivas,
  onDelete,
  colaboradores,
  onSaved,
}: Props) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCorretiva, setEditingCorretiva] =
    useState<CorretivaConcluida | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatDateBR = (isoDate?: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("pt-BR");
  };

  const formatDateTimeBR = (isoDate?: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleString("pt-BR", {
      timeZone: "America/Fortaleza",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleMouseEnter = (imageUrl: string, e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredImage(imageUrl);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }, 500); // 500ms delay before showing
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredImage(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredImage) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleEditClick = (c: CorretivaConcluida) => {
    setEditingCorretiva(c);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCorretiva(null);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Edit Information Alert - Improved responsive layout */}
      <Alert variant="info" className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Informações sobre Edição</strong>
          </div>
          <div className="text-md-end">
            As corretivas concluídas podem ser editadas, mas as fotos não podem
            ser modificadas.
          </div>
        </div>
      </Alert>

      {/* Display details of the corretiva being edited - Improved responsive layout */}
      {editingCorretiva && (
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <i className="bi bi-pencil me-2"></i>
            Editando Corretiva Concluída
          </Card.Header>
          <Card.Body>
            <Row>
              <Col xs={12} md={6}>
                <p className="mb-1">
                  <strong>ID:</strong> {editingCorretiva.id}
                </p>
                <p className="mb-1">
                  <strong>Data Inicial:</strong>{" "}
                  {formatDateBR(editingCorretiva.data)}
                </p>
                <p className="mb-1">
                  <strong>Data Conclusão:</strong>{" "}
                  {formatDateTimeBR(editingCorretiva.dataConclusao)}
                </p>
                <p className="mb-1">
                  <strong>Local:</strong> {editingCorretiva.local}
                </p>
                <p className="mb-1">
                  <strong>Sistema:</strong> {editingCorretiva.sistema || "-"}
                </p>
                <p className="mb-1">
                  <strong>Categoria:</strong> {editingCorretiva.categoria || "-"}
                </p>
              </Col>
              <Col xs={12} md={6}>
                <p className="mb-1">
                  <strong>Colaborador:</strong> {editingCorretiva.colaborador}
                </p>
                <p className="mb-1">
                  <strong>Solicitante:</strong> {editingCorretiva.solicitante}
                </p>
                <p className="mb-1">
                  <strong>Solicitação:</strong> {editingCorretiva.solicitacao}
                </p>
                {/* {editingCorretiva.dataEdicao && (
                  <p className="mb-1"><strong>Última Edição:</strong> {formatDateTimeBR(editingCorretiva.dataEdicao)}</p>
                )} */}
              </Col>
            </Row>
            <div className="mt-3">
              <p className="mb-1">
                <strong>Descrição:</strong> {editingCorretiva.descricao}
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th className="d-none d-md-table-cell">Data Inicial</th>
              <th className="d-none d-md-table-cell">Data Conclusão</th>
              <th>Local</th>
              <th className="d-none d-lg-table-cell">Sistema</th>
              <th className="d-none d-xl-table-cell">Categoria</th>
              <th className="d-none d-lg-table-cell">Colaborador</th>
              <th className="d-none d-lg-table-cell">Solicitante</th>
              <th className="d-none d-xl-table-cell">Solicitação</th>
              <th>Fotos</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {corretivas.map((c) => (
              <tr key={c.id}>
                <td className="d-none d-md-table-cell">
                  {formatDateBR(c.data)}
                </td>
                <td className="d-none d-md-table-cell">
                  {formatDateBR(c.dataConclusao)}
                </td>
                <td>
                  <div>
                    <div className="d-md-none">
                      <div className="d-flex justify-content-between">
                        <span>{formatDateBR(c.data)}</span>
                        <span>{formatDateBR(c.dataConclusao)}</span>
                      </div>
                      <div className="mt-1">
                        <strong>{c.local}</strong>
                      </div>
                      <div className="mt-1">
                        <small className="text-muted">
                          <i className="bi bi-person me-1"></i>
                          {c.colaborador || "-"}
                        </small>
                      </div>
                      <div className="mt-1">
                        <small className="text-muted">
                          <i className="bi bi-person-check me-1"></i>
                          {c.solicitante}
                        </small>
                      </div>
                      <div className="mt-1">
                        <small className="text-muted">{c.solicitacao}</small>
                      </div>
                    </div>
                    <div className="d-none d-md-block">{c.local}</div>
                  </div>
                </td>
                <td className="d-none d-lg-table-cell">{c.sistema || "-"}</td>
                <td className="d-none d-xl-table-cell">{c.categoria || "-"}</td>
                <td className="d-none d-lg-table-cell">{c.colaborador}</td>
                <td className="d-none d-lg-table-cell">{c.solicitante}</td>
                <td className="d-none d-xl-table-cell">{c.solicitacao}</td>
                <td>
                  {c.fotos && c.fotos.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {c.fotos.slice(0, 3).map((f, i) => (
                        <div
                          key={i}
                          className="position-relative"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleImageClick(typeof f === "string" ? f : f.url)
                          }
                          onMouseEnter={(e) =>
                            handleMouseEnter(
                              typeof f === "string" ? f : f.url,
                              e
                            )
                          }
                          onMouseLeave={handleMouseLeave}
                          onMouseMove={handleMouseMove}
                        >
                          <div
                            className="bg-light border rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                          >
                            <i className="bi bi-image text-muted"></i>
                          </div>
                          {i === 2 && c.fotos && c.fotos.length > 3 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
                              +{c.fotos.length - 3}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="p-1">
                  <div className="d-flex flex-column align-items-center">
                    <div className="d-md-none mb-2">
                      {c.fotos && c.fotos.length > 0 ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            handleImageClick(
                              typeof c.fotos?.[0] === "string"
                                ? c.fotos?.[0]
                                : c.fotos?.[0]?.url || ""
                            )
                          }
                          className="d-flex align-items-center w-100"
                        >
                          <i className="bi bi-images me-1"></i>
                          Ver fotos
                        </Button>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-image me-1"></i>
                          Sem fotos
                        </span>
                      )}
                    </div>
                    <div className="w-100">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleEditClick(c)}
                        >
                          <i className="bi bi-pencil d-md-none"></i>
                          <span className="d-none d-md-inline">Editar</span>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-fill"
                          onClick={() => onDelete(c)}
                        >
                          <i className="bi bi-trash d-md-none"></i>
                          <span className="d-none d-md-inline">Excluir</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Tooltip */}
      {hoveredImage && (
        <div
          className="position-fixed bg-white border rounded shadow"
          style={{
            left: `${tooltipPosition.x + 15}px`,
            top: `${tooltipPosition.y + 15}px`,
            zIndex: 1000,
            pointerEvents: "none",
            maxWidth: "200px",
            maxHeight: "200px",
            padding: "5px",
          }}
        >
          <Image
            src={hoveredImage}
            alt="Preview"
            width={120}
            height={120}
            style={{
              maxWidth: "120px",
              maxHeight: "120px",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Visualização de Imagem</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Visualização"
              className="img-fluid"
              style={{ maxHeight: "70vh" }}
              width={800}
              height={600}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
          {selectedImage && (
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              Abrir em Nova Aba
            </a>
          )}
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <CorretivaConcluidaFormModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        editData={editingCorretiva}
        colaboradores={colaboradores}
        onSaved={() => {
          handleCloseEditModal();
          onSaved();
        }}
      />
    </>
  );
}
