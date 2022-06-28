import { useContext, useEffect } from 'react';

import { Can } from '../components/Can';
import { AuthContext } from '../contexts/AuthContext';
import { setupAPIClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  // const userCanSeeMetrics = useCan({
  //   roles: ["administrator", "editor"],
  // });

  useEffect(() => {
    api.get("/me").then((response) => console.log(response));
  });

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      {/* {userCanSeeMetrics && (
        <div>Posso ver Métricas pois esse usuário tem permissão</div>
      )} */}

      <button onClick={signOut}>Sign out</button>

      <Can permissions={["metrics.list"]}>
        <div>Posso ver Métricas pois esse usuário tem permissão</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  // try {
  const response = await apiClient.get("/me");
  // } catch (err) {
  //   // console.log(err instanceof AuthTokenError);
  //   console.log(err)

  //   destroyCookie(ctx, 'nextauth.token')
  //   destroyCookie(ctx, 'nextauth.refreshToken')
  //   return {
  //     redirect: {
  //       destination: "/",
  //       permanent: false,
  //     },
  //   };
  // }

  console.log(response.data);

  return {
    props: {},
  };
});
