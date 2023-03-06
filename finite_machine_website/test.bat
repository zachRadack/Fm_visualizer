@echo off

SET app=myflaskapp
SET app_name=myflaskappcontainer
docker "build" "-t" "%app%" "."
docker "run" "-d" "-p" "5000:5000" "--name=%app_name%" "-v" "%PWD%:\app" "%app%"