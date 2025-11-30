
export default function OnlineUsers({users} : {users: string[]}) {
  return (
    <div className="flex flex-col gap-4 max-w-[300px] mt-10 border border-1 border-gray-700 p-4 rounded-lg">
        <h2 className="font-bold text-xl">Online Players</h2>
        <ul className="flex flex-col gap-3">
            {users.map((user, index) => {
                return (
                    <div key={index} className="flex justify-between items-center rounded-lg bg-gray-800 p-3">
                        <li>{user}</li>
                        <button className="px-3 py-1 bg-green-600 text-white cursor-pointer rounded-lg hover:bg-green-800 duration-250">Challenge</button>
                    </div>
                );
            })}
        </ul>
    </div>
  )
}