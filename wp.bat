@echo off
REM WP-CLI shortcut. Runs against the cms/ install from anywhere in the project.
pushd "%~dp0cms"
php "%~dp0tools\wp-cli.phar" %*
popd
