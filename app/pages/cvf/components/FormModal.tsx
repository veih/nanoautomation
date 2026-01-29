"use client";

import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import { Cvf } from "../../../../types";

interface FormModalProps {
    show: boolean;
    onHide: () => void;
    title: string;
    isEdit: boolean;
    onSubmit: (e?: React.FormEvent) => void;
    loading: boolean;
    fields: {
        name: string;
        label: string;
        type: "text" | "textarea" | "select";
        options?: { value: string; label: string }[];
        required?: boolean;
    }[];
    values: Partial<Cvf>;
    errors: Record<string, string>;
    onChange: (field: keyof Cvf, value: string | number | boolean | null) => void;
}

const FormModal = ({
    show,
    onHide,
    title,
    onSubmit,
    loading,
    fields,
    values,
    errors,
    onChange,
}: FormModalProps) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="h4">{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    <Row>
                        {fields.map((field) => (
                            <Col md={6} key={field.name} className="mb-3">
                                <Form.Group controlId={field.name}>
                                    <Form.Label className={field.required ? "fw-bold" : ""}>
                                        {field.label}
                                        {field.required && (
                                            <span className="text-danger ms-1">*</span>
                                        )}
                                    </Form.Label>
                                    {field.type === "select" ? (
                                        <Form.Select
                                            value={values[field.name as keyof Cvf] || ""}
                                            onChange={(e) =>
                                                onChange(field.name as keyof Cvf, e.target.value)
                                            }
                                            isInvalid={!!errors[field.name]}
                                            className="form-control-lg"
                                        >
                                            <option value="">Selecione...</option>
                                            {field.options?.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    ) : field.type === "textarea" ? (
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={values[field.name as keyof Cvf] || ""}
                                            onChange={(e) =>
                                                onChange(field.name as keyof Cvf, e.target.value)
                                            }
                                            isInvalid={!!errors[field.name]}
                                            className="form-control-lg"
                                        />
                                    ) : (
                                        <Form.Control
                                            type="text"
                                            value={values[field.name as keyof Cvf] || ""}
                                            onChange={(e) =>
                                                onChange(field.name as keyof Cvf, e.target.value)
                                            }
                                            isInvalid={!!errors[field.name]}
                                            className="form-control-lg"
                                        />
                                    )}
                                    <Form.Control.Feedback type="invalid">
                                        {errors[field.name]}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={loading}
                        className="px-4"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        className="px-4"
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Salvando...
                            </>
                        ) : (
                            "Salvar"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default FormModal;