"use client";

import { ReactNode, useRef } from "react";
import { Modal, Button, Form, Spinner, Image } from "react-bootstrap";
import { ComponentErrorBoundary } from "../../../../components/ErrorBoundary";

interface FormField {
  name: string;
  label: string;
  type?: "text" | "select" | "textarea" | "checkbox" | "date";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
}

interface FormModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  isEdit: boolean;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children?: ReactNode;
  fields?: FormField[];
  values?: Record<string, unknown>;
  errors?: Record<string, string>;
  onChange?: (field: string, value: string | boolean) => void;
  submitLabel?: string;
  cancelLabel?: string;
  // Image upload props
  showImageUpload?: boolean;
  onImageChange?: (images: string[]) => void;
  images?: string[];
  onRemoveImage?: (index: number) => void;
  // Mobile camera props
  showCameraButton?: boolean;
  onOpenCamera?: () => void;
}

export function FormModal({
  show,
  onHide,
  title,
  isEdit,
  onSubmit,
  loading = false,
  children,
  fields = [],
  values = {},
  errors = {},
  onChange,
  submitLabel,
  cancelLabel = "Cancelar",
  showImageUpload = false,
  onImageChange,
  images = [],
  onRemoveImage,
  showCameraButton = false,
  onOpenCamera,
}: FormModalProps) {
  const defaultSubmitLabel = isEdit ? "Salvar Alterações" : "Salvar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderField = (field: FormField) => {
    const value = values[field.name] || "";
    const error = errors[field.name];

    switch (field.type) {
      case "select":
        return (
          <Form.Select
            value={String(value)}
            onChange={(e) => onChange?.(field.name, e.target.value)}
            isInvalid={!!error}
            required={field.required}
          >
            <option value="">Selecione...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        );
      case "textarea":
        return (
          <Form.Control
            as="textarea"
            rows={field.rows || 3}
            value={String(value)}
            onChange={(e) => onChange?.(field.name, e.target.value)}
            isInvalid={!!error}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case "checkbox":
        return (
          <Form.Check
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange?.(field.name, e.target.checked)}
            isInvalid={!!error}
            label={field.label}
            required={field.required}
          />
        );
      case "date":
        return (
          <Form.Control
            type="date"
            value={String(value)}
            onChange={(e) => onChange?.(field.name, e.target.value)}
            isInvalid={!!error}
            required={field.required}
          />
        );
      default:
        return (
          <Form.Control
            type={field.type || "text"}
            value={String(value)}
            onChange={(e) => onChange?.(field.name, e.target.value)}
            isInvalid={!!error}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newImages: string[] = [...images];

      files.forEach((file) => {
        // Check file type
        if (!file.type.match('image.*')) {
          // In a real implementation, we would show an error message
          return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          // In a real implementation, we would show an error message
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            onImageChange?.(newImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    onRemoveImage?.(index);
  };

  return (
    <ComponentErrorBoundary componentName="FormModal">
      <Modal show={show} onHide={onHide} centered size="xl">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i
              className={`bi ${isEdit ? "bi-pencil" : "bi-plus-circle"} me-2`}
            ></i>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={onSubmit} className="form-enhanced">
          <Modal.Body>
            {fields.map((field) => (
              <Form.Group key={field.name} className="mb-3">
                {field.type !== "checkbox" && (
                  <Form.Label>
                    {field.label}
                    {field.required && <span className="text-danger"> *</span>}
                  </Form.Label>
                )}
                {renderField(field)}
                {errors[field.name] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[field.name]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            ))}

            {/* Image upload for defective devices */}
            {showImageUpload && (
              <Form.Group className="mb-3">
                <Form.Label>Imagens do Defeito</Form.Label>

                {/* File selection */}
                <div className="d-flex flex-column gap-2 mb-2">
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="imageUpload"
                      ref={fileInputRef}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="bi bi-folder me-1"></i>
                      Selecionar Imagens
                    </Button>

                    {/* Mobile camera button */}
                    {showCameraButton && (
                      <Button
                        variant="primary"
                        onClick={onOpenCamera}
                      >
                        <i className="bi bi-camera me-1"></i>
                        Capturar com Câmera
                      </Button>
                    )}
                  </div>
                </div>

                {/* Preview of selected images */}
                {images.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Fotos Capturadas:</strong>
                      <span className="badge bg-primary rounded-pill">{images.length}</span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                          <Image
                            src={image}
                            alt={`Foto ${index + 1}`}
                            width={100}
                            height={100}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 translate-middle rounded-circle"
                            style={{ width: '24px', height: '24px', padding: '0' }}
                            onClick={() => removeImage(index)}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Form.Group>
            )}

            {children}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              type="submit"
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
                  {submitLabel || defaultSubmitLabel}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </ComponentErrorBoundary>
  );
}