@echo off
rem dev-up.cmd - the portfolio's two servers in windows that live
rem independently of any AI session: one console per process.
rem   agent :8787 (npm run chat:dev - supervised, respawns on death)
rem   site  :4173 (vite preview of dist, LAN-visible via --host)
cd /d %~dp0..
start "agent" cmd /k npm.cmd run chat:dev
start "site"  cmd /k npm.cmd run preview -- --port 4173 --strictPort --host
echo Two windows opened: agent + site. Close them to stop the servers.
