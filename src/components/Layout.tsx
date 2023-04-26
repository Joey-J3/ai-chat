import Head from 'next/head';
import { ReactNode } from 'react';
import clsx, { ClassValue } from 'clsx';
import Header from '@/components/Header';

interface LayoutProps {
  children: ReactNode;
  home?: boolean;
  className?: ClassValue[];
}

export const siteTitle = 'Joey Blog';

function Layout({ children, className = [] }: LayoutProps) {
  return (
    <div className={clsx(['w-[100vw] max-h-[100vh] bg-inherit overflow-auto', ...className])}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Post any you want here!" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle,
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <main>{children}</main>
    </div>
  );
}

export default Layout;
