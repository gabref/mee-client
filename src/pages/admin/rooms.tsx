import { useContext, useEffect, useState } from 'react';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import decode from 'jwt-decode'

import RoomHostList from '@components/RoomsList/RoomHostList';
import { AuthContext } from 'src/contexts/AuthContext';
import { EVENTS } from '@data/events';

const SOCKET_CONFIG: Partial<ManagerOptions | SocketOptions> = {
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	autoConnect: true,
};

function AdminRooms() {
	const [ socket, setSocket ] = useState<Socket | null>(null);
	const [ reRendered, setReRendered ] = useState(true);
    const { userState  } = useContext(AuthContext)

	useEffect(
		() => {
			if (!userState) return

			const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET + EVENTS.NAMESPACE.ADMIN
			const newSocket = io(socketUrl, SOCKET_CONFIG)
			setSocket(newSocket)

			window.onunload = window.onbeforeunload = () => {
			    newSocket.emit(EVENTS.ADMIN.EXIT, userState.id)
			    newSocket.disconnect()
			}

			function onConnect() {
				newSocket.emit(EVENTS.ADMIN.CONNECT, {
 					id: userState?.id, 
					socketId: newSocket.id,
					reRendered
				})
				setReRendered(false)
			}

			newSocket.on('connect', onConnect)

			const timeoutSocket = setInterval(() => {
				newSocket.close()
			}, 1/2 * 60 * 1000)

			const timeout = setInterval(() => {
				socket?.close()
				console.log('closing connection settimeout')
				const newSocket = io(socketUrl, SOCKET_CONFIG)
				setSocket(newSocket)
			}, (1/2 * 60 * 1000) + 3)

			console.log('the page rerendered')

			return () => {
				newSocket.removeListener('connect', onConnect)
				newSocket.close();
				clearInterval(timeout)
				clearInterval(timeoutSocket)
			};
		},
		[ setSocket, userState ]
	)

	return (
		<div>
            { userState ? (
                userState?.roles.indexOf('host')! == -1 ? (
                    <div>
                        <p>{userState.name}</p>
                        <p>Você não tem acesso a essa página!</p>
                    </div>
                ) : (
                    socket ? (
                        <div>
                            <RoomHostList socket={socket} userState={userState} />
                        </div>
                    ) : (
                        <p>No socket</p>
                    )
                )
            ) : (
                <p>Carregando state...</p>
            )}
		</div>
	);
}

export default AdminRooms

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const permittedRoles = ['host', 'admin']
	const { ['mee.token-auth']: token } = parseCookies(ctx)

	if (!token) {
		return {
			redirect: {
				destination: '/admin/login',
				permanent: false
			}
		}
	}

	// check user roles
	const user = decode<{ id: string, roles: string[] }>(token)

	let userHasValidPermissions: boolean = false

    if (!!permittedRoles && permittedRoles!.length > 0) {
        const hasRoles = permittedRoles?.some(role => {
            return user?.roles.includes(role)
        })

		userHasValidPermissions = hasRoles	
    }

	if (!userHasValidPermissions) {
		return {
			redirect: {
				destination: '/login',
				permanent: false
			}
		}
	}

	return {
		props: { }
	}
}