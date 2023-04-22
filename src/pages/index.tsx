import Chat from '@/chatgpt/components/Chat'
import Layout from '@/components/Layout'

function Home() {
  return (
    <Layout>
        {/* <Suspense fallback={<CircularProgress />}> */}
        <div style={{height: '90vh'}}>
          <Chat />
        </div>
        {/* </Suspense> */}
    </Layout>
  )
}

export default Home
