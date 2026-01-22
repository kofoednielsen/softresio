![softres.io logo](/frontend/public/logo-orange.png)

## Development

To get a working development environment with frontend, backend, database and hot reloading of all, just run:
```sh
    docker compose up
```

To get deno for linting and such, use the nix shell or get it else where.
```sh
    nix develop -c $SHELL
```

*Make sure to type check and format the code before pushing*

## Formatting
```sh
deno fmt
```

## Type checking

You will need to run `deno install` dependencies for linting, then just:
```
deno check
```

You have to run type checking and formatting in both `frontend` and `backend` or you can just use the supplied helper script `check_everything.sh`





### Deployment

Automated, just do this

```sh
    git push origin main
```
