import { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';

import RoomHostList from '@components/ui/RoomHostList';
import { AuthContext } from 'src/contexts/AuthContext';

const SOCKET_CONFIG = {
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	autoConnect: true,
};

function AdminRooms() {
	const [ socket, setSocket ] = useState<Socket | null>(null);
    const { userState  } = useContext(AuthContext)

	useEffect(
		() => {
			const namespace = '/admin'
			const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET + namespace
			const newSocket = io(socketUrl, SOCKET_CONFIG)
			setSocket(newSocket)

			return () => {
				newSocket.close();
			};
		},
		[ setSocket ]
	)

	return (
		<div>
            { userState ? (
                userState?.roles.indexOf('host')! == -1 ? (
                    <div>
                        <p>{userState.nome}</p>
                        <p>Você não tem acesso a essa página!</p>
                    </div>
                ) : (
                    socket ? (
                        <div>
                            <RoomHostList socket={socket} />
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
	const { ['mee.token-auth']: token } = parseCookies(ctx)

	if (!token) {
		return {
			redirect: {
				destination: 'admin/login',
				permanent: false
			}
		}
	}

	return {
		props: {

		}
	}
}