import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

const Sidebar = dynamic(() => import('@/chatgpt/components/sidebar'), { ssr: false });
const Chat = dynamic(() => import('@/chatgpt/components/Chat'), { ssr: false });

function Home() {
  return (
    <Layout>
      <div className="flex w-full" style={{ height: '90vh' }}>
        <Sidebar />
        <div className="flex-1">
          <Chat />
        </div>
      </div>
    </Layout>
  );
}

export default Home;
