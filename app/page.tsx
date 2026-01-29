"use client";

import React from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";


export default function Home() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-dark text-center p-4 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="mb-5">
              <h1 className="display-3 fw-bold mb-4 text-primary">
                Nanoautomation Shopping Rio Mar Fortaleza
              </h1>
              <p className="lead mb-5 text-muted">
                Sistema de monitoramento e gestão inteligente para centrais de
                monitoramento, equipamentos, atuadores e sensores.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
                <Link href="/dashboard" passHref>
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Acessar Dashboard
                  </Button>
                </Link>

                <Link href="/pages/defeitos" passHref>
                  <Button
                    variant="warning"
                    size="lg"
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Dispositivos com Defeito
                  </Button>
                </Link>

                <Link href="/pages/api-status" passHref>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-bar-chart me-2"></i>
                    Status dos Sistemas
                  </Button>
                </Link>
              </div>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <i className="bi bi-gear display-5 text-primary mb-3"></i>
                    <h3 className="h5 fw-bold mb-2">
                      Centrais de Monitoramento
                    </h3>
                    <p className="text-muted mb-0">
                      Gestão completa de casas de máquinas e equipamentos
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <i className="bi bi-shop display-5 text-success mb-3"></i>
                    <h3 className="h5 fw-bold mb-2">Monitoramento de Lojas</h3>
                    <p className="text-muted mb-0">
                      Supervisão de estabelecimentos comerciais
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <i className="bi bi-lightning display-5 text-warning mb-3"></i>
                    <h3 className="h5 fw-bold mb-2">Ações Corretivas</h3>
                    <p className="text-muted mb-0">
                      Gestão de manutenções e correções de sistema
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3 shadow-sm p-5 text-start">
              <h2 className="h3 fw-bold mb-4 text-center">Sobre o Sistema</h2>
              <p className="mb-4">
                O Dashboard Nanoautomation é uma solução avançada para
                monitoramento e gestão de sistemas de automação comercial. Nosso
                sistema oferece uma visão abrangente de todos os componentes
                críticos da sua infraestrutura.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{" "}
                      Monitoramento em tempo real
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{" "}
                      Alertas automatizados
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{" "}
                      Relatórios personalizados
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{" "}
                      Gestão de ativos
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{" "}
                      Controle de manutenção
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{" "}
                      Análise preditiva
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-light {
          background: linear-gradient(
            135deg,
            #f8f9fa 0%,
            #e9ecef 100%
          ) !important;
        }

        .card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .display-3 {
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .lead {
          font-size: 1.25rem;
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .display-3 {
            font-size: 2.5rem;
          }

          .lead {
            font-size: 1.1rem;
          }

          .d-flex {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}