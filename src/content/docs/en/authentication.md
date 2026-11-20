---
title: Authentication and authorization
description: How an AIP 1.0 service verifies access tokens, links a token subject to an actor, and then lets the definition decide what each caller may read and change.
status: sourced
source:
  - product/OPERATIONS.md
  - product/IDP-RUNBOOK.md
  - product/GETTING-STARTED.md
  - spec/definition-syntax.md
checked: 2026-11-21
---

Authentication answers who is calling. Authorization answers what that caller may do. In AIP the first is checked by the server against an external identity provider's tokens, and the second is the definition. A token never carries permission itself.

## The model {#model}

`aip service` only verifies tokens. Login, refresh tokens and user management belong to your identity provider and your application. The service never issues tokens and has no development bypass. The request path is:

1. The caller sends `Authorization: Bearer <access token>`.
2. The service verifies the signature, issuer, audience and lifetime against the provider's public keys (JWKS).
3. The token's issuer and `sub` are looked up in the server's own table of principals. The match gives the actor row the request runs as.
4. The definition's row, field and transition policies decide the rest.

A request with no token is anonymous. Nothing is open to anonymous callers unless the definition says so.

## Token profile {#token-profile}

Configure your provider to issue tokens with exactly this profile:

| Item | Requirement |
|---|---|
| Signature | RS256. The public key is an RSA key of 2048 to 4096 bits with a `kid` |
| Header | `typ` is exactly `at+jwt`, `kid` is present. `jku`, `x5u`, `x5c`, `crit`, `zip` and `cty` are rejected |
| Claims | `iss` equal to the configured issuer character for character (trailing slash included), `aud` containing the configured audience, `sub`, `iat`, `exp` |
| Lifetime | `exp - iat` between 1 and 900 seconds |
| `nbf` | Optional. If present it is enforced |
| Clock | No leeway. Keep the server and the provider in sync |

A token's role or actor id claims are never used as AIP permissions.

## Configure the service {#configure}

```json
{
  "schema": "aip_my_app",
  "database_url_env": "AIP_DATABASE_URL",
  "listen": "127.0.0.1:8080",
  "wire": "decimal",
  "allowed_origins": ["https://app.example.com"],
  "auth": {
    "issuer": "https://issuer.example.com",
    "audience": "aip-api",
    "jwks": {"kind": "https", "url": "https://issuer.example.com/.well-known/jwks.json"}
  }
}
```

Copy `issuer` and `jwks_uri` from the provider's `/.well-known/openid-configuration` without changing a character. A local file works too: `{"kind":"file","path":"./jwks.json"}`, relative to the configuration file. Unknown configuration keys are errors, and credentials must not be put in this file. The listener is loopback HTTP only; terminate HTTPS in a reverse proxy.

To check a provider before touching your own configuration or database:

```sh
aip service idp-readiness --issuer 'https://<tenant>/<realm>'
```

## Link users to actors {#principals}

The actor row is application data and must exist first. An operator then links the provider's subject to it:

```sh
aip service principal --config service.json bind --subject user-42 --actor 42
aip service principal --config service.json revoke --subject user-42
```

`bind` refuses to move a subject to a different actor. `revoke` deactivates the link and invalidates tokens issued up to that moment, including those issued in the same second. Reactivating the same actor does not revive revoked tokens; issue a new one a second later. Revoking an unknown subject fails with `PRINCIPAL_NOT_FOUND`. For schedulers and webhooks, which have no user, bind a separate service subject to an actor that has only the permissions it needs.

## Authorization is the definition {#authorization}

- A resource without `rows read` exposes no rows. Policies are conditions on the actor, such as `rows read when member = actor`.
- `field ... read when` redacts one field: where the condition is false, the value is null.
- A transition's `allow` says who may call it, and `from` says which rows it may start from. Callers cannot ask for anything the definition did not expose.
- A row the caller cannot see is reported exactly like a row that does not exist (`WIRE.MISSING_TARGET`). Failures from `unique`, `limit` and `invariant` use the same code whether or not the conflicting row is visible, and never reveal that row's id or values.
- Counts are the exception. A `count` does not inherit `rows read`; see [Definition syntax](/docs/definition-syntax/#public-count).

There is no automatic tenant isolation in 1.0. Write the organization condition into each policy yourself (`rows read when org = actor.org`). See [Known limitations](/docs/known-limitations/#tenants).

## What was verified {#verified}

| Check | Result |
|---|---|
| JWKS over HTTPS, issuer, audience, `typ` and lifetime checks, key rotation, forged tokens, provider outage with cached keys | Verified against a local mock provider |
| A real Keycloak 26.2.5 container's tokens, validated against its HTTPS JWKS and linked to a principal | Verified |
| A TLS reverse proxy (Caddy) in front of the service | Verified locally and in CI |
| Auth0 and Entra ID issuing this exact token profile | Not verified. No account was available |
| nginx in front of the service | Not run |

The Keycloak and proxy results come from fixtures in AIP Core's CI. They are not a check of your production provider. Test your own provider with `aip service idp-readiness` and one real token against `POST /session`.
