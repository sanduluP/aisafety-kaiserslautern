# Before launch

Search the repo for `TODO(` to find each item in place.

## Blocking — the site should not be publicly announced until these are done

- [ ] **Written consent for the c/o address** — `impressum.html`, `privacy.html`
      The imprint gives Priyabanta Sandulu c/o AI Safety Aachen e. V.,
      Hünefeldstraße 35, 52068 Aachen — the same arrangement AI Safety Nuremberg
      and Safe AI Germany use. A c/o only counts as a *ladungsfähige Anschrift*
      if post actually reaches the named person there, so this needs Aachen e. V.
      to agree in writing to receive and forward our mail. Keep the confirmation.

- [ ] **Second contact channel** — `impressum.html`, marked `TODO(imprint-phone)`
      § 5 DDG wants a means of rapid, direct contact beyond the email address.
      Safe AI Germany publishes a phone number. Add one if you are willing to.

- [ ] **Mailbox for hello@aisafetykaiserslautern.org**
      The address is now live on the site in three places. It needs MX records on
      the domain and an actual mailbox behind it, or mail to it will bounce.

## Content still missing

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
- [x] Signal group invite URL — live in the join card and the footer
- [x] LinkedIn page URL — `linkedin.com/company/ai-safety-kaiserslautern`
- [x] Imprint restructured against the Safe AI Germany imprint: § 5 DDG heading
      (not the repealed TMG), a separate § 18 (2) MStV responsible person, a note
      that the group has no legal form of its own, and a link-liability clause

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
