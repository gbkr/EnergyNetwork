import { types } from "energylib";
import styled from "styled-components";

const PeerUl = styled.ul`
  list-style-type: none;
`;
const PeerLi = styled.li`
  padding-top: 10px;
`;

function Peers({ peers }: types.PeerInfo) {
  return (
    <>
      <h2>Peers</h2>
      Peer count: {peers.length}
      <br />
      <PeerUl>
        {peers.map((peer: types.PeerConfig) => (
          <PeerLi key={peer.publicKey}>
            {peer.type} {peer.publicKey.substring(0, 8)}... [
            <a href={peer.URL}>{peer.URL}</a>]
          </PeerLi>
        ))}
      </PeerUl>
    </>
  );
}

export default Peers;
