
export default async function User({params} : {params: Promise<{username: string}>}) {
    const username = (await params).username;

  return (
    <div>
        <h1>{username}</h1>
        
    </div>
  )
}
