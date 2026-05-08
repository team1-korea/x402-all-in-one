import { Avalanche } from 'avalanche';
import { EVMAPI, KeyChain as EVMKeyChain } from 'avalanche/dist/apis/evm';
import { BinTools } from 'avalanche';

const bintools = BinTools.getInstance();

export class AvalancheProvider {
  private static instance: AvalancheProvider;
  public avalanche: Avalanche;
  public evm: EVMAPI;
  public keychain: EVMKeyChain;

  private constructor() {
    const url = new URL(process.env.RPC_URL || 'http://localhost:9650');
    const protocol = url.protocol.replace(':', '');
    const host = url.hostname;
    const port = parseInt(url.port || (protocol === 'https' ? '443' : '80'));
    const networkID = parseInt(process.env.NETWORK_ID || '1'); // Default to Mainnet or custom

    this.avalanche = new Avalanche(host, port, protocol, networkID);
    this.evm = this.avalanche.CChain();
    this.keychain = this.evm.keyChain();

    if (process.env.ADMIN_PRIVATE_KEY) {
      this.keychain.importKey(process.env.ADMIN_PRIVATE_KEY);
    }
  }

  public static getInstance(): AvalancheProvider {
    if (!AvalancheProvider.instance) {
      AvalancheProvider.instance = new AvalancheProvider();
    }
    return AvalancheProvider.instance;
  }

  public getAdminAddress() {
    return this.keychain.getAddresses()[0]?.toString('hex');
  }
}
