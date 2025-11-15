interface NetworkConfig {
    chainName: string;
    chainId: string;
    prefix: string;      // Add chainId as a property
    coinType: string;
    rpcUrl: string;
    denom: string;
    gasPrice: string;
    granteeAddress: string;
    recipientAddress: string;
  }
  
  const networkConfigs: NetworkConfig[] = [
    {
      chainName: 'Cosmos Hub',
      chainId: 'cosmoshub-4',
      prefix: 'cosmos',
      coinType: '118',
      rpcUrl: 'https://cosmos-rpc.publicnode.com',
      denom: 'uatom',
      gasPrice: '0.05',
      granteeAddress: 'cosmos1x53taaq35lz4tn2k82x96kwj05z0aqqee4htuw',
      recipientAddress: 'cosmos1ladxhn8c0ppzfav95xyagw5qwx86tmkqjlce84'

    },
    {
      chainName: 'Injective',
      chainId: 'injective-1',
      prefix: 'inj',
      coinType: '60',
      rpcUrl: 'https://tm.injective.network',
      denom: 'uinj',
      gasPrice: '0.05',
      granteeAddress: 'inj15g076k2nqzpv69jla9d5ddgr3negvp3v507f30',
      recipientAddress: 'inj1dw5jkmmtm0rskdpegflvv8n7q3l8z83yhns890'
    },
    {
      chainName: 'Celestia',
      chainId: 'celestia',
      prefix: 'celestia',
      coinType: '118',
      rpcUrl: 'https://celestia-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'utia',
      gasPrice: '0.05',
      granteeAddress: 'celestia1x53taaq35lz4tn2k82x96kwj05z0aqqeglxmxr',
      recipientAddress: 'celestia1ladxhn8c0ppzfav95xyagw5qwx86tmkqr4ffac'
    },
    {
      chainName: 'Osmosis',
      chainId: 'osmosis-1',
      prefix: 'osmo',
      coinType: '118',
      rpcUrl: 'https://osmosis-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'uosmo',
      gasPrice: '0.05',
      granteeAddress: 'osmo1x53taaq35lz4tn2k82x96kwj05z0aqqe3wym2u',
      recipientAddress: 'osmo1ladxhn8c0ppzfav95xyagw5qwx86tmkq6ytf38'
    },
    {
      chainName: 'Stargaze',
      chainId: 'stargaze-1',
      prefix: 'stars',
      coinType: '118',
      rpcUrl: 'https://stargaze-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'ustars',
      gasPrice: '10',
      granteeAddress: 'stars1x53taaq35lz4tn2k82x96kwj05z0aqqedfqkhl',
      recipientAddress: 'stars1ladxhn8c0ppzfav95xyagw5qwx86tmkqxr0yvy'
    },
    {
      chainName: 'Nibiru',
      chainId: 'cataclysm-1',
      prefix: 'nibi',
      coinType: '118',
      rpcUrl: 'https://rpc.nibiru.fi',
      denom: 'unibi',
      gasPrice: '0.05',
      granteeAddress: 'nibi1x53taaq35lz4tn2k82x96kwj05z0aqqewsnj4a',
      recipientAddress: 'nibi1ladxhn8c0ppzfav95xyagw5qwx86tmkq96uqwx'
    },
    {
      chainName: 'DYDX',
      chainId: 'dydx-mainnet-1',
      prefix: 'dydx',
      coinType: '118',
      rpcUrl: 'https://dydx-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'adydx',
      gasPrice: '13000000000',
      granteeAddress: 'dydx1x53taaq35lz4tn2k82x96kwj05z0aqqesve0ue',
      recipientAddress: 'dydx1ladxhn8c0ppzfav95xyagw5qwx86tmkqmxka8z'
    },
    {
      chainName: 'Agoric',
      chainId: 'agoric-3',
      prefix: 'agoric',
      coinType: '564',
      rpcUrl: 'https://leap-node-proxy.numia.xyz/agoric-rpc',
      denom: 'ubld',
      gasPrice: '0.05ubld',
      granteeAddress: 'agoric1as6frwpe0deetc46udravgssechtmhqyf9sl5u',
      recipientAddress: 'agoric1gmsyj86vhfshw5sfeqsfnef58xxegm440wdkup'
    },
    {
      chainName: 'Juno',
      chainId: 'juno-1',
      prefix: 'juno',
      coinType: '118',
      rpcUrl: 'https://juno-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'ujuno',
      gasPrice: '0.5ujuno',
      granteeAddress: 'juno1x53taaq35lz4tn2k82x96kwj05z0aqqe085smj',
      recipientAddress: 'juno1ladxhn8c0ppzfav95xyagw5qwx86tmkqydmzqf'
    },
    {
      chainName: 'Akash',
      chainId: 'akashnet-2',
      prefix: 'akash',
      coinType: '118',
      rpcUrl: 'https://akash-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'uakt',
      gasPrice: '0.05uakt',
      granteeAddress: 'akash1x53taaq35lz4tn2k82x96kwj05z0aqqe5w6v95',
      recipientAddress: 'akash1ladxhn8c0ppzfav95xyagw5qwx86tmkqly4770'
    },
    {
      chainName: 'Kava',
      chainId: 'kava_2222-10',
      prefix: 'kava',
      coinType: '459',
      rpcUrl: 'https://kava-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'ukava',
      gasPrice: '0.127ukava',
      granteeAddress: 'kava13jz5uzc8cq7m65mje0dqaw663dkytmvxm0rx0m',
      recipientAddress: 'kava1k9rggnh60nf8735cn6lkymmeahggvhtjels5ge'
    },
    {
      chainName: 'Kujira',
      chainId: 'kaiyo-1',
      prefix: 'kujira',
      coinType: '118',
      rpcUrl: 'https://kujira-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'ukuji',
      gasPrice: '0.5ukuji',
      granteeAddress: 'kujira1x53taaq35lz4tn2k82x96kwj05z0aqqega4n3y',
      recipientAddress: 'kujira1ladxhn8c0ppzfav95xyagw5qwx86tmkqrh6p2l'
    },
    {
      chainName: 'Terra 2.0',
      chainId: 'phoenix-1',
      prefix: 'terra',
      coinType: '330',
      rpcUrl: 'https://terra-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'uluna',
      gasPrice: '0.34uluna',
      granteeAddress: 'terra1yzuha936wj5s5fmfccxnjdmp5x0uwgz7vptgju',
      recipientAddress: 'terra1ejg9ak6cqet08ppd5ma8nyjvulnvwkjpkg92st'
    },
    {
      chainName: 'Chihuahua',
      chainId: 'chihuahua-1',
      prefix: 'chihuahua',
      coinType: '118',
      rpcUrl: 'https://chihuahua-rpc.publicnode.com:443/9a353f27b9e92ea909491d7ae2102facbd105fb06ff969932dd19cb31d93d0a6',
      denom: 'uhuahua',
      gasPrice: '0.34',
      granteeAddress: 'chihuahua1x53taaq35lz4tn2k82x96kwj05z0aqqe6q69av',
      recipientAddress: 'chihuahua1ladxhn8c0ppzfav95xyagw5qwx86tmkq324hxh'
    },
    {
      chainName: 'Gravity Bridge',
      chainId: 'gravity-bridge-3',
      prefix: 'gravity',
      coinType: '118',
      rpcUrl: 'https://rpc.lavenderfive.com:443/gravitybridge',
      denom: 'ugraviton',
      gasPrice: '0.34',
      granteeAddress: 'gravity1x53taaq35lz4tn2k82x96kwj05z0aqqea99nex',
      recipientAddress: 'gravity1x53taaq35lz4tn2k82x96kwj05z0aqqea99nex'
    }
    // Add more networks here
    // Add more networks here
  ];
  
  export default networkConfigs;