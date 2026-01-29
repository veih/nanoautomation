@echo off
echo Iniciando servidor de desenvolvimento com ngrok...

:: Muda para o diretório do projeto
cd /d "c:\nanoSevece"

:: Verifica se o ngrok está instalado
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo Erro: ngrok não está instalado no sistema.
    echo.
    echo Para instalar o ngrok:
    echo 1. Acesse https://ngrok.com/download
    echo 2. Baixe e instale o ngrok para Windows
    echo 3. Execute 'ngrok config add-authtoken ^<seu-token^>' após a instalação
    echo.
    echo Alternativamente, você pode instalar via npm:
    echo npm install -g ngrok
    echo.
    pause
    exit /b 1
)

:: Inicia o servidor de desenvolvimento e ngrok
echo Iniciando o servidor de desenvolvimento Next.js na porta 3001...
start "Next.js Dev Server" cmd /k "npm run dev"

echo Aguardando o servidor iniciar...
timeout /t 10 /nobreak >nul

echo Iniciando ngrok na porta 3001...
ngrok http 3001

exit