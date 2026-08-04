# Before launch

Search the repo for `TODO(` to find each item in place.

## Blocking — the site should not be publicly announced until these are done

- [ ] **Impressum** — `impressum.html`
      German law (§ 5 DDG) requires a real name, a physical postal address, and an
      email address. Currently `[Full name]` / `[Street and number]`. A site without
      a valid Impressum is an *Abmahnung* risk, so this one is not optional.
      If nobody wants to publish a private address, the usual options are:
      register as an e.V., use an institutional address with permission, or pay for
      a *ladungsfähige Anschrift* service.

- [ ] **Privacy policy responsible party** — `privacy.html`
      The address block must match the Impressum.

- [ ] **Mailbox for hello@aisafetykaiserslautern.org**
      The address is now live on the site in three places. It needs MX records on
      the domain and an actual mailbox behind it, or mail to it will bounce.

## Content still missing

- [ ] **Signal group invite URL** — `index.html`, marked `data-todo="signal-group-invite-url"`
      Appears twice: the join card and the footer. Should look like
      `https://signal.group/#CjQK...`.

- [ ] **LinkedIn page URL** — `index.html`, marked `data-todo="linkedin-page-url"`
      Also appears twice. Should look like `https://www.linkedin.com/company/...`.

- [ ] **First events** — `index.html`, Events section
      Replace the "being scheduled" notice with the commented-out `event-list`
      block just below it.

- [ ] **Photo of Kaiserslautern** *(optional)* — `index.html`, hero
      The hero currently shows the shield emblem on a navy panel, which stands on
      its own. If you prefer a photo, the swap is documented in a comment right
      there. Use a licence-clear image (Unsplash / Pexels) and credit the
      photographer.

## Done

- [x] Domain registered — `aisafetykaiserslautern.org`
- [x] Domain active in Cloudflare
- [x] Repository — `github.com/sanduluP/aisafety-kaiserslautern`
- [x] Contact email decided — `hello@aisafetykaiserslautern.org`
- [x] Worker deploying from the repo — `aisafety-kaiserslautern.s-priyabant.workers.dev`

## Verify

- [ ] Attach the custom domain `aisafetykaiserslautern.org` (and `www`) to the
      Worker, in **Settings → Domains & Routes**. Until that is done the site only
      answers on the `workers.dev` address.
- [ ] Check the claim in the "Why AI safety" section still reads accurately —
      it cites Grace et al. 2022 and links the paper.
- [ ] Confirm the Kaiserslautern institutions named in "Why here" (RPTU, DFKI,
      MPI-SWS, Fraunhofer ITWM and IESE) are described the way you want.
- [ ] Decide whether to list organiser names anywhere.

## After launch

- [ ] Ask Safe AI Germany to add the site to the city list on safeaigermany.org.
- [ ] Share the URL once in a chat app to check the social preview card renders.
