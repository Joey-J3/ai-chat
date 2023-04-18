
import { revalidate } from '@module-federation/nextjs-mf/utils';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    // can be any lifecycle or implementation you want
    ctx?.res?.on('finish', () => {
      revalidate().then((shouldUpdate) => {
        console.log('finished sending response', shouldUpdate);
      });
    });

    return initialProps;
  }
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
