var app = new Vue({
    el: '#app',
    data: {
        connectText: 'Connect',
        mintText: 'Mint',
        address: '',
        isClaimed: false,
        isInWl: false
    },
    computed: {

    },
    mounted() {
        if (!window.ethereum) {
            alert('Error environment!')
            return
        }
        window.ethereum.on('accountsChanged', () => {
            window.location.reload()
        })
        window.ethereum.on('chainChanged', (e) => {
            window.location.reload()
        })
    },
    methods: {
        async connect() {
            if (!window.ethereum) {
                alert('Error environment!')
                return
            }
            await window.ethereum.enable()
            const chainId = await ethereum.request({ method: 'eth_chainId' })

            if (chainId !== __ENV.chainId) {
                alert('Please swith to EthereumChain')
                return
            }
            let provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress()
            this.connectText = address.substr(0, 4) + '****' + address.substr(address.length - 4, address.length);
        },
        async mint() {
            if (!window.ethereum) {
                alert('Error environment!')
                return
            }
            if (this.connectText === 'Connect') {
                alert('Please connect the wallet first!')
                return
            }
            await window.ethereum.enable()
            var contract_address = __ENV.contract_address
            let provider = new ethers.providers.Web3Provider(window.ethereum);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(contract_address, __ABI, signer);

            let address = await signer.getAddress()
            let tree = new MerkleTree(__whitelist, ethers.utils.keccak256, { sort: true })
            let merkleProof = tree.getHexProof(ethers.utils.keccak256(address))
            const isClaimed = await contract.claimed(address)
            const isInWl = __whitelist.includes(ethers.utils.keccak256(address))
            this.isClaimed = isClaimed
            this.isInWl = isInWl
            if (isClaimed) {
                return alert('You have already claimed this NFT!')
            }
            if (!isInWl) {
                return alert('Your address is not in the whitelist!')
            }
            await contract.mint(merkleProof).catch(err => {
                alert(err.message)
            })
            alert('Mint Successfully!')
        }
    }
})