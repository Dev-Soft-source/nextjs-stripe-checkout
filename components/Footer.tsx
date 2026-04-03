import { HeartIcon } from '@heroicons/react/solid';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="container xl:max-w-screen-xl mx-auto p-6 mt-8 text-center">
      <p>
        <a
          href="https://alterclass.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-current"
        >
          {t('footer.madeWith')}{' '}
          <HeartIcon className="inline-block w-4 h-4 -mt-1 text-red-600 animate-pulse" />{' '}
          {t('footer.byLine')}
        </a>
      </p>
    </footer>
  );
};

export default Footer;
