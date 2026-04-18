import type { Locale } from "@/components/layout/locale-toggle";

export type I18nDict = {
  hero: {
    eyebrow: string;
    h1a: string;
    h1b: string;
    lede: string;
    ctaPrimary: string;
    ctaGhost: string;
  };
  footer: {
    tagline: string;
  };
  about: {
    lede: string;
    problemKicker: string;
    approachKicker: string;
  };
  app: {
    connectTitle: string;
    connectSubtitle: string;
    issuerLabel: string;
    issuerDesc: string;
    employerLabel: string;
    employerDesc: string;
    issuerRegisterTitle: string;
    issuerRegisterSubtitle: string;
    issuerDoneTitle: string;
    issuerDoneSubtitle: string;
    verifyTitle: string;
    verifySubtitle: string;
    payTitle: string;
    paySubtitle: string;
    doneTitle: string;
    doneSubtitle: string;
  };
};

export const i18n: Record<Locale, I18nDict> = {
  en: {
    hero: {
      eyebrow: "Stellar Testnet / Soroban / Freighter",
      h1a: "Verify credentials.",
      h1b: "Settle payment in one flow.",
      lede: "Stellaroid Earn anchors certificate hashes on Stellar so employers can verify the record and pay the graduate without leaving the workflow. No email thread, no invoice delay, no platform fee.",
      ctaPrimary: "Try the demo ->",
      ctaGhost: "See a sample Proof Block - no wallet needed",
    },
    footer: {
      tagline:
        "On-chain credential registry on Stellar testnet. Built for the Stellar Philippines UniTour bootcamp.",
    },
    about: {
      lede: "A thin piece of software around one idea: certificates should be verifiable in seconds, not emails. And if they're verifiable, the grad should get paid on the same tap.",
      problemKicker:
        "The certificate is real. The problem is that proving it costs more than hiring around it.",
      approachKicker:
        "The canonical output isn't the UI — it's the event stream on stellar.expert. The proof is public by default.",
    },
    app: {
      connectTitle: "Connect your wallet to start",
      connectSubtitle: "You'll sign transactions with Freighter.",
      issuerLabel: "Issuer",
      issuerDesc: "Register certs",
      employerLabel: "Employer",
      employerDesc: "Verify & pay",
      issuerRegisterTitle: "Register a certificate",
      issuerRegisterSubtitle:
        "Upload the PDF or paste a 64-char hex hash. You'll sign as the issuer.",
      issuerDoneTitle: "Certificate registered",
      issuerDoneSubtitle: "Switch to Employer role to verify and pay.",
      verifyTitle: "Verify the certificate",
      verifySubtitle: "Look it up first, then mark it verified on-chain.",
      payTitle: "Pay the verified student",
      paySubtitle: "Send the payment amount linked to this certificate.",
      doneTitle: "All done",
      doneSubtitle: "The proof block is ready to share.",
    },
  },
  tl: {
    hero: {
      eyebrow: "Stellar Testnet / Soroban / Freighter",
      h1a: "I-verify ang credentials.",
      h1b: "I-settle ang bayad sa iisang flow.",
      lede: "I-anchor ang certificate hash sa Stellar. Employer verifies in seconds. Bayad agad — walang email thread, walang invoice delay, walang platform fee.",
      ctaPrimary: "Subukan ang demo ->",
      ctaGhost: "Tingnan ang sample Proof Block — walang wallet kailangan",
    },
    footer: {
      tagline:
        "On-chain credential registry sa Stellar testnet. Ginawa para sa Stellar Philippines UniTour bootcamp.",
    },
    about: {
      lede: "One idea lang: certificates should be verifiable in seconds — hindi sa pamamagitan ng email. Tapos mabayaran agad.",
      problemKicker:
        "Real ang certificate niya. Pero proving it? Mas mahal pa kaysa mag-hire ng iba.",
      approachKicker:
        "Hindi lang na-verify ang credential — na-pay na rin si Maria. Sa iisang session. Yun ang punto.",
    },
    app: {
      connectTitle: "I-connect ang wallet mo para magsimula",
      connectSubtitle: "Mag-sign ng transactions gamit ang Freighter.",
      issuerLabel: "Issuer",
      issuerDesc: "Mag-register ng certs",
      employerLabel: "Employer",
      employerDesc: "I-verify at bayaran",
      issuerRegisterTitle: "Mag-register ng certificate",
      issuerRegisterSubtitle:
        "I-upload ang PDF o i-paste ang 64-char hex hash. Ikaw ang mag-sign bilang issuer.",
      issuerDoneTitle: "Certificate registered na",
      issuerDoneSubtitle: "Lumipat sa Employer role para i-verify at bayaran.",
      verifyTitle: "I-verify ang certificate",
      verifySubtitle: "Hanapin muna, tapos i-mark na verified on-chain.",
      payTitle: "Bayaran ang verified student",
      paySubtitle:
        "I-send ang payment amount na naka-link sa certificate na ito.",
      doneTitle: "Tapos na",
      doneSubtitle: "Handa na ang proof block para i-share.",
    },
  },
};
