import { CategoryPairing } from "@/components/category/CategoryPairing";
import { FooterGlobal } from "@/components/chrome/FooterGlobal";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { LandingSocial } from "@/components/home/LandingSocial";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { BenefitsSection } from "@/components/pdp/BenefitsSection";
import { BmiCalculator } from "@/components/pdp/BmiCalculator";
import { CampaignBarrage } from "@/components/pdp/CampaignBarrage";
import { PdpLeadSplit } from "@/components/pdp/PdpLeadSplit";
import { barrageFrames } from "@/content/pdp/barrage";
import { PdpStickyChip } from "@/components/pdp/PdpStickyChip";
import { ProductBuyBox } from "@/components/pdp/ProductBuyBox";
import { QualitySection } from "@/components/pdp/QualitySection";
import { StageSequence } from "@/components/pdp/StageSequence";
import type { CategoryPdpData } from "@/content/pdp/types";
import styles from "./CategoryPdp.module.css";

export function CategoryPdp({ data }: { data: CategoryPdpData }) {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <div className={styles.hero}>
        <div className={styles.heroChrome}>
          <SiteHeader overlay />
        </div>
        <ProductBuyBox
          layout="split"
          heroSrc={data.heroSrc}
          heroCallouts={data.heroCallouts}
          themeId={data.themeId}
          title={data.title}
          category={data.category}
          tagline={data.tagline}
          stockLabel={data.stockLabel}
          price={data.price}
          compareAtPrice={data.compareAtPrice}
          primaryCta={data.primaryCta}
          primaryCtaHref={data.primaryCtaHref}
          body={data.body}
          payLine={data.payLine}
          trust={data.trust}
          planLabel={data.planLabel}
          planOptions={data.planOptions}
          promo={data.promo}
          sandboxLive={data.sandboxLive}
          gallery={{
            plates: data.gallery.plates,
            proofThumb: data.gallery.proofThumb,
          }}
          faq={data.buyBoxFaq}
          disclaimer={data.disclaimer}
          safetyLink={data.safetyLink}
        />
      </div>
      <main id="main" className={styles.main}>
        <BenefitsSection
          headline={data.benefits.headline}
          subtitle={data.benefits.subtitle}
          items={data.benefits.items}
        />
        <CampaignBarrage
          frames={barrageFrames(
            data.themeId,
            data.barrageGraphic,
            data.barragePack,
          )}
        />
        <PdpLeadSplit
          title={data.lead.title}
          body={data.lead.body}
          cta={data.lead.cta}
          media={data.lead.media}
        />
        <QualitySection
          titleLines={data.quality.titleLines}
          body={data.quality.body}
          metrics={data.quality.metrics}
          backgroundSrc={data.quality.backgroundSrc}
          mediaFit="cover"
          plate={data.quality.plate}
          themeId={data.themeId}
        />
        {data.bmi ? (
          <BmiCalculator
            title={data.bmi.title}
            body={data.bmi.body}
            disclaimer={data.bmi.disclaimer}
            mediaSrc={data.bmi.mediaSrc}
          />
        ) : null}
        <StageSequence
          id="care-flow"
          headline={data.careFlow.headline}
          subtitle={data.careFlow.subtitle}
          stages={data.careFlow.stages}
          collage={data.careFlow.collage}
          themeId={data.themeId}
        />
        {data.pairing ? (
          <div className={styles.pairingWrap}>
            <CategoryPairing pairing={data.pairing} />
          </div>
        ) : null}
        <ScrollReveal>
          <LandingSocial title={data.social.title} columns={data.social.columns} />
        </ScrollReveal>
      </main>
      <FooterGlobal />
      <PdpStickyChip
        name={data.title}
        imageSrc={data.heroSrc}
        ctaLabel={data.primaryCta}
        ctaHref={data.primaryCtaHref}
      />
    </>
  );
}
