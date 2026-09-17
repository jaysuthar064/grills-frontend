# Grill On the Green - local WordPress

## Quick start

```powershell
.\start-wordpress.ps1
.\start-wordpress.ps1 -Admin
.\start-wordpress.ps1 -Stop
```

Or double-click `start-wordpress.bat`.

| | |
|---|---|
| Site | http://localhost:8885 |
| Admin | http://localhost:8885/wp-admin/ |
| REST | http://localhost:8885/wp-json/gotg/v1/home |
| Login | `admin` / `admin` |

One-click admin login:

```text
http://localhost:8885/?gotg_login=1&token=85db595dc94d97306fecd6924fadc27c2115079c117afd2f21bc3299e1b16c7d
```

This is handled by `cms/wp-content/mu-plugins/gotg-local-login.php`. It only
works when WordPress is running as `local`, the request comes from loopback, and
the token matches `GOTG_LOCAL_LOGIN_TOKEN` in `cms/wp-config.php`.

## Layout

```text
Grill On the Green/
|-- cms/                    WordPress backend served by Laragon
|-- frontend/               Next.js frontend
|-- tools/wp-cli.phar       WP-CLI
|-- start-wordpress.ps1     Start/stop launcher
|-- start-wordpress.bat     Double-click wrapper
`-- wp.bat                  WP-CLI shortcut
```

## Laragon wiring

Laragon serves the site through this junction:

```text
C:\laragon\www\grill-on-the-green -> <project>\cms
```

The Apache vhost listens on port `8885`, so the project root and `frontend/`
are not web-exposed.

## WP-CLI

```powershell
.\wp.bat plugin list
.\wp.bat user list
.\wp.bat option get siteurl
```

## Database

| | |
|---|---|
| Name | `grill_on_the_green` |
| User | `root` |
| Password | empty |
| Host | `127.0.0.1:3306` |

Apache and MySQL are shared with your other Laragon sites. `-Stop` stops the
shared services, so use it only when you want all local Laragon sites down.
