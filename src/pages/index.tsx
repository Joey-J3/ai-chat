import Chat from '@/chatgpt/components/Chat'
import { CircularProgress } from '@mui/material'
import { Suspense } from 'react'

function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <div className="lg:w-2/3">
          {/* <Suspense fallback={<CircularProgress />}> */}
            <Chat />
          {/* </Suspense> */}
        </div>
      </section>
    </div>
  )
}

export default Home
