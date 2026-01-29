// app/components/Accessibility.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button, Toast, ToastContainer } from "react-bootstrap";

// ==================== ACCESSIBILITY CONTEXT ====================
interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
};

export const AccessibilityContext = React.createContext<{
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
}>({
  settings: defaultSettings,
  updateSetting: () => {},
});

// ==================== ACCESSIBILITY PROVIDER ====================
export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem("accessibility-settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading accessibility settings:", error);
    }

    // Detect system preferences
    const detectSystemPreferences = () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const highContrast = window.matchMedia(
        "(prefers-contrast: high)"
      ).matches;

      setSettings((prev) => ({
        ...prev,
        reducedMotion: reducedMotion || prev.reducedMotion,
        highContrast: highContrast || prev.highContrast,
      }));
    };

    detectSystemPreferences();

    // Listen for system preference changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");

    reducedMotionQuery.addEventListener("change", detectSystemPreferences);
    highContrastQuery.addEventListener("change", detectSystemPreferences);

    return () => {
      reducedMotionQuery.removeEventListener("change", detectSystemPreferences);
      highContrastQuery.removeEventListener("change", detectSystemPreferences);
    };
  }, []);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;

    if (settings.highContrast) {
      root.setAttribute("data-high-contrast", "true");
    } else {
      root.removeAttribute("data-high-contrast");
    }

    if (settings.largeText) {
      root.setAttribute("data-large-text", "true");
    } else {
      root.removeAttribute("data-large-text");
    }

    if (settings.reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    } else {
      root.removeAttribute("data-reduced-motion");
    }

    if (settings.screenReaderMode) {
      root.setAttribute("data-screen-reader-mode", "true");
    } else {
      root.removeAttribute("data-screen-reader-mode");
    }

    // Save to localStorage
    try {
      localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving accessibility settings:", error);
    }
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ==================== ACCESSIBILITY PANEL ====================
export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = React.useContext(AccessibilityContext);

  return (
    <>
      {/* Accessibility Button */}
      <Button
        variant="outline-secondary"
        size="sm"
        className="position-fixed"
        style={{
          bottom: "20px",
          right: "20px",
          zIndex: 1050,
          borderRadius: "50%",
          width: "50px",
          height: "50px",
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Opções de Acessibilidade"
        title="Abrir opções de acessibilidade"
      >
        <i className="bi bi-universal-access" aria-hidden="true"></i>
      </Button>

      {/* Accessibility Panel */}
      <ToastContainer
        position="bottom-end"
        className="p-3"
        style={{ zIndex: 1051 }}
      >
        <Toast
          show={isOpen}
          onClose={() => setIsOpen(false)}
          className="accessibility-panel"
          style={{ minWidth: "300px" }}
        >
          <Toast.Header>
            <i className="bi bi-universal-access me-2" aria-hidden="true"></i>
            <strong className="me-auto">Acessibilidade</strong>
          </Toast.Header>
          <Toast.Body>
            <div className="d-flex flex-column gap-3">
              {/* High Contrast */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="highContrast"
                  checked={settings.highContrast}
                  onChange={(e) =>
                    updateSetting("highContrast", e.target.checked)
                  }
                />
                <label className="form-check-label" htmlFor="highContrast">
                  <strong>Alto Contraste</strong>
                  <br />
                  <small className="text-muted">
                    Aumenta o contraste para melhor legibilidade
                  </small>
                </label>
              </div>

              {/* Large Text */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="largeText"
                  checked={settings.largeText}
                  onChange={(e) => updateSetting("largeText", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="largeText">
                  <strong>Texto Grande</strong>
                  <br />
                  <small className="text-muted">
                    Aumenta o tamanho do texto
                  </small>
                </label>
              </div>

              {/* Reduced Motion */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="reducedMotion"
                  checked={settings.reducedMotion}
                  onChange={(e) =>
                    updateSetting("reducedMotion", e.target.checked)
                  }
                />
                <label className="form-check-label" htmlFor="reducedMotion">
                  <strong>Reduzir Animações</strong>
                  <br />
                  <small className="text-muted">
                    Diminui ou remove animações
                  </small>
                </label>
              </div>

              {/* Screen Reader Mode */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="screenReaderMode"
                  checked={settings.screenReaderMode}
                  onChange={(e) =>
                    updateSetting("screenReaderMode", e.target.checked)
                  }
                />
                <label className="form-check-label" htmlFor="screenReaderMode">
                  <strong>Modo Leitor de Tela</strong>
                  <br />
                  <small className="text-muted">
                    Otimiza para leitores de tela
                  </small>
                </label>
              </div>
            </div>

            <hr />

            {/* Keyboard Shortcuts */}
            <div className="mt-3">
              <h6>Atalhos de Teclado:</h6>
              <small className="text-muted">
                <div>
                  <kbd>Alt</kbd> + <kbd>A</kbd> - Abrir este painel
                </div>
                <div>
                  <kbd>Alt</kbd> + <kbd>H</kbd> - Alternar alto contraste
                </div>
                <div>
                  <kbd>Alt</kbd> + <kbd>T</kbd> - Alternar texto grande
                </div>
                <div>
                  <kbd>Tab</kbd> - Navegar pelos elementos
                </div>
                <div>
                  <kbd>Enter</kbd> ou <kbd>Espaço</kbd> - Ativar elemento
                </div>
              </small>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

// ==================== SKIP TO CONTENT LINK ====================
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content visually-hidden-focusable"
      style={{
        position: "absolute",
        left: "-9999px",
        zIndex: 9999,
        padding: "8px 16px",
        background: "#000",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "4px",
      }}
      onFocus={(e) => {
        e.target.style.left = "10px";
        e.target.style.top = "10px";
      }}
      onBlur={(e) => {
        e.target.style.left = "-9999px";
        e.target.style.top = "auto";
      }}
    >
      Pular para o conteúdo principal
    </a>
  );
}

// ==================== ARIA LIVE REGION ====================
export function LiveRegion() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Listen for custom events to announce messages
    const handleAnnouncement = (event: CustomEvent<{ message: string }>) => {
      setMessage(event.detail.message);
      // Clear message after announcement
      setTimeout(() => setMessage(""), 100);
    };

    window.addEventListener("announce", handleAnnouncement as EventListener);
    return () =>
      window.removeEventListener(
        "announce",
        handleAnnouncement as EventListener
      );
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
}

// ==================== FOCUS TRAP ====================
export function FocusTrap({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

// ==================== KEYBOARD NAVIGATION HOOK ====================
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A: Open accessibility panel
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        const accessibilityButton = document.querySelector(
          '[aria-label="Opções de Acessibilidade"]'
        ) as HTMLElement;
        accessibilityButton?.click();
      }

      // Alt + H: Toggle high contrast
      if (e.altKey && e.key === "h") {
        e.preventDefault();
        const event = new CustomEvent("toggle-accessibility", {
          detail: { setting: "highContrast" },
        });
        window.dispatchEvent(event);
      }

      // Alt + T: Toggle large text
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        const event = new CustomEvent("toggle-accessibility", {
          detail: { setting: "largeText" },
        });
        window.dispatchEvent(event);
      }

      // Escape: Close modals/panels
      if (e.key === "Escape") {
        const modals = document.querySelectorAll(".modal.show");
        if (modals.length > 0) {
          const closeButton = modals[modals.length - 1].querySelector(
            ".btn-close"
          ) as HTMLElement;
          closeButton?.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

// ==================== ANNOUNCEMENT UTILITY ====================
export function announce(message: string) {
  const event = new CustomEvent("announce", { detail: { message } });
  window.dispatchEvent(event);
}

export default AccessibilityProvider;
