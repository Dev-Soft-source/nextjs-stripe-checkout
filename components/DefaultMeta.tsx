import Head from 'next/head';
import { useTranslation } from 'react-i18next';

export function DefaultMeta() {
  const { t } = useTranslation();

  return (
    <Head>
      <title>{t('meta.defaultTitle')}</title>
      <meta name="description" content={t('meta.defaultDescription')} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
