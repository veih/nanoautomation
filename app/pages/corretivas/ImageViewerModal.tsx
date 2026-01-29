import { Modal, Button, Card, Row, Col, Alert } from "react-bootstrap";
import Image from "next/image";
import { ComponentErrorBoundary } from "../../components/ErrorBoundary";

interface Props {
  show: boolean;
  onHide: () => void;
  urls: string[];
}

export default function ImageViewerModal({ show, onHide, urls }: Props) {
  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `imagem-${index + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <ComponentErrorBoundary componentName="Visualizador de Imagens">
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-images me-2"></i>
            Fotos da Corretiva ({urls.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {urls.length > 0 ? (
            <Row className="g-3">
              {urls.map((url, index) => (
                <Col xs={12} sm={6} md={4} key={index}>
                  <Card className="h-100 shadow-sm">
                    <div
                      className="position-relative"
                      style={{
                        height: '200px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => openInNewTab(url)}
                    >
                      <Image
                        src={url}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.transform = 'scale(1)';
                        }}
                        unoptimized={true}
                        onError={() => {
                          console.error(`Failed to load image: ${url}`);
                          // Don't manipulate the src directly to avoid infinite loops
                          // The Image component will handle fallback automatically
                        }}
                      />

                      {/* Overlay with view icon */}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          opacity: 0,
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0';
                        }}
                      >
                        <i className="bi bi-eye text-white" style={{ fontSize: '2rem' }}></i>
                      </div>
                    </div>

                    <Card.Body className="p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Foto {index + 1}</small>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openInNewTab(url)}
                            title="Abrir em nova aba"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleDownload(url, index)}
                            title="Baixar imagem"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                        </div>
                      </div>

                      {/* URL with copy functionality */}
                      <div className="mt-2">
                        <small className="text-muted d-block text-truncate" title={url}>
                          {url}
                        </small>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="mt-1 w-100"
                          onClick={() => {
                            navigator.clipboard.writeText(url).then(() => {
                              // Simple feedback without toast for now
                              const btn = document.activeElement as HTMLButtonElement;
                              const originalText = btn.innerHTML;
                              btn.innerHTML = '<i class="bi bi-check"></i> Copiado!';
                              setTimeout(() => {
                                btn.innerHTML = originalText;
                              }, 1500);
                            });
                          }}
                        >
                          <i className="bi bi-clipboard me-1"></i>
                          Copiar URL
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 mb-3">Nenhuma foto encontrada</h5>
              <p className="mb-0">Esta corretiva não possui fotos anexadas.</p>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex justify-content-between align-items-center w-100">
            <small className="text-muted">
              {urls.length > 0 && (
                <>
                  <i className="bi bi-info-circle me-1"></i>
                  Clique nas imagens para visualizar em tela cheia
                </>
              )}
            </small>
            <Button variant="secondary" onClick={onHide}>
              <i className="bi bi-x-circle me-2"></i>
              Fechar
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </ComponentErrorBoundary>
  );
}
