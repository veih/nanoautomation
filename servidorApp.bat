@echo off
echo NanoFront - Servidor com opções ngrok
echo ====================================

:: Muda para o diretório do projeto
cd /d "c:\nanoSevece"

:menu
echo.
echo Selecione uma opção:
echo 1. Iniciar servidor local apenas
echo 2. Iniciar servidor com ngrok (expor à internet)
echo 3. Sair
echo.

choice /c 123 /m "Escolha uma opção"

if errorlevel 3 goto :exit
if errorlevel 2 goto :start_with_ngrok
if errorlevel 1 goto :start_local

:start_local
echo Iniciando servidor local...
start cmd /k "npm run start"
echo O servidor local está a ser iniciado numa nova janela do prompt.
goto :menu

:start_with_ngrok
:: Verifica se o ngrok está instalado
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo.
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
    goto :menu
)

echo Iniciando servidor com ngrok...
echo Iniciando servidor local...
start "Servidor Local" cmd /k "npm run start"

echo Aguardando o servidor iniciar...
timeout /t 10 /nobreak >nul

echo Iniciando ngrok...
start "ngrok" cmd /k "ngrok http 3000"
echo O servidor local e o ngrok estão a ser iniciados em janelas separadas.
goto :menu

:exit
echo Saindo...
exit