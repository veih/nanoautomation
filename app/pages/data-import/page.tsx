"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import type {
  Cm,
  Equipamento,
  Atuador,
  Sensor,
  Loja,
  EquipamentoLoja,
  AtuadorLoja,
  SensorLoja,
  Corretiva,
  Colaborador,
  Cvf,
} from "../../../types";

// Define a more specific type for the imported JSON data
interface ImportData {
  cms?: Cm[];
  equipamentos?: Equipamento[];
  atuadores?: Atuador[];
  sensores?: Sensor[];
  lojas?: Loja[];
  equipamentosLoja?: EquipamentoLoja[];
  atuadoresLoja?: AtuadorLoja[];
  sensoresLoja?: SensorLoja[];
  corretivas?: Corretiva[];
  colaboradores?: Colaborador[];
  cvfs?: Cvf[];
}

export default function DataImportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<ImportData | null>(null);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
      setJsonData(null);
    }
  };

  const handleLoadData = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo para carregar.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Read the file content
      const fileContent = await readFileAsText(file);
      const data = JSON.parse(fileContent);

      setJsonData(data);
      setSuccess(
        "Dados carregados com sucesso! Agora clique em 'Povoar Banco' para importar."
      );
    } catch (err) {
      setError(`Erro ao carregar dados: ${(err as Error).message}`);
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateDatabase = async () => {
    if (!jsonData) {
      setError("Por favor, carregue os dados primeiro.");
      return;
    }

    if (password !== "veih") {
      setError(
        "Senha incorreta. Por favor, insira a senha correta para povoar o banco."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send the data to the import API
      const response = await fetch("/api/import-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (response.ok) {
          setSuccess("Banco de dados povoado com sucesso!");
          setJsonData(null);
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setError(
            `Falha ao povoar banco: ${result.error || "Erro desconhecido"}`
          );
        }
      } else {
        // If it's not JSON, it's likely an HTML error page
        const text = await response.text();
        setError(
          `Erro ao povoar banco: Servidor retornou um erro. Status: ${response.status}`
        );
        console.error("Server returned non-JSON response:", text);
      }
    } catch (err) {
      setError(`Erro ao povoar banco: ${(err as Error).message}`);
      console.error("Import error:", err);
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="container py-4">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h1 className="mb-0">
            <i className="bi bi-upload me-2"></i>
            Importar Dados do Banco
          </h1>
        </Card.Header>
        <Card.Body>
          <p className="lead">
            Esta página permite importar dados do banco de dados a partir de um
            arquivo JSON previamente exportado.
          </p>

          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Aviso:</strong> A importação substituirá todos os dados
            atuais no banco de dados. Certifique-se de ter um backup antes de
            proceder.
          </Alert>

          {error && (
            <Alert variant="danger" className="mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mt-3">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Selecione o arquivo de exportação:</Form.Label>
            <div className="d-flex">
              <Button
                variant="outline-secondary"
                onClick={handleFileClick}
                disabled={loading}
                className="me-2"
              >
                <i className="bi bi-folder me-2"></i>
                Escolher Arquivo
              </Button>
              <div className="d-flex align-items-center">
                {file ? (
                  <span>{file.name}</span>
                ) : (
                  <span className="text-muted">Nenhum arquivo selecionado</span>
                )}
              </div>
              <Form.Control
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="d-none"
              />
            </div>
          </Form.Group>

          <div className="d-flex justify-content-center mt-3">
            <Button
              variant="info"
              size="lg"
              onClick={handleLoadData}
              disabled={loading || !file}
              className="d-flex align-items-center me-3"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Carregando...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-arrow-up me-2"></i>
                  Carregar Dados
                </>
              )}
            </Button>
          </div>

          {jsonData && (
            <div className="mt-4">
              <Form.Group className="mb-3">
                <Form.Label>Senha para povoar o banco:</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    disabled={loading}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Button>
                </InputGroup>
              </Form.Group>

              <div className="d-flex justify-content-center">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handlePopulateDatabase}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Povoando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-database me-2"></i>
                      Povoar Banco
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h5>Instruções para uso:</h5>
            <ol>
              <li>
                Selecione o arquivo &quot;DBJsonVeih.json&quot; exportado
                anteriormente
              </li>
              <li>
                Clique no botão &quot;Carregar Dados&quot; para pré-visualizar
                os dados
              </li>
              <li>Insira a senha &quot;veih&quot; para confirmar</li>
              <li>
                Clique no botão &quot;Povoar Banco&quot; para importar os dados
              </li>
            </ol>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
