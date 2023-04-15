import Chat from '@/chatgpt/components/Chat'
import Layout from '@/components/Layout'

function Home() {
  return (
    <Layout>
        {/* <Suspense fallback={<CircularProgress />}> */}
          <Chat />
        {/* </Suspense> */}
    </Layout>
  )
}

export default Home
