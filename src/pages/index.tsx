import Layout from '@/components/Layout';
import Chat from '@/chatgpt/components/Chat';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/chatgpt/components/sidebar'), { ssr: false });

function Home() {
  return (
    <Layout>
      {/* <Suspense fallback={<CircularProgress />}> */}
      <div className="flex w-full" style={{ height: '90vh' }}>
        <Sidebar />
        <div className="flex-1">
          <Chat />
        </div>
      </div>
      {/* </Suspense> */}
    </Layout>
  );
}

export default Home;
