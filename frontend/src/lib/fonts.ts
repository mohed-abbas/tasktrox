import localFont from 'next/font/local';

export const haffer = localFont({
  src: [
    {
      path: '../../public/fonts/Haffer-TRIAL-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Haffer-TRIAL-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Haffer-TRIAL-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Haffer-TRIAL-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-haffer',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
});
