(
  function () {




    const connectApp = new Vue({
      el: '#connect-app',
      data: {
        connectText: 'Connect',
      },
      mounted() {
      },
      methods: {
        async connect() {
          let provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          if (!window.ethereum) {
            alert('Error environment!')
            return
          }

          await window.ethereum.enable()

          const chainId = await ethereum.request({ method: 'eth_chainId' })

          if (chainId !== __CONFIG.chainId) {
            alert('Please swith to EthereumChain')
            return
          }

          const address = await signer.getAddress();
          this.connectText = address.substr(0, 4) + '****' + address.substr(address.length - 4, address.length);
        }
      }
    })

    const mintApp = new Vue({
      el: '#mint-app',
      data: {
        connectText: 'Connect',
        mintText: 'Mint',
        address: '',
        isClaimed: false,
        isOpen: false,
        loading: false
      },
      computed: {

      },
      mounted() {
        window.ethereum.on('accountsChanged', () => {
          window.location.reload()
        })
        window.ethereum.on('chainChanged', (e) => {
          window.location.reload()
        })
      },
      methods: {
        async mint() {
          if (!window.ethereum) {
            alert('Error environment!')
            return
          }
          if (connectApp.connectText === 'Connect') {
            alert('Please connect the wallet first!')
            return
          }
          if (this.loading) {
            return
          }
          this.loading = true
          try {
            await window.ethereum.enable()
            var contract_address = __CONFIG.contract_address
            let provider = new ethers.providers.Web3Provider(window.ethereum);
            let signer = provider.getSigner();
            let contract = new ethers.Contract(contract_address, __ABI, signer);
            let address = await signer.getAddress()

            const isClaimed = await contract.claimed(address)
            const isOpen = await contract.claimed(address)
            this.isClaimed = isClaimed
            this.isOpen = isOpen
            if (isClaimed) {
              this.loading = false
              return alert('You have already claimed this NFT!')
            }
            if (!isOpen){
              this.loading = false
              return alert('Mint is Not Open Now')
            }

            await contract.mint()
            this.loading = false
            alert('Mint Successfully!')
          } catch (err) {
            const msg = err.data && err.data.message || err.message
            this.loading = false
            alert(msg)
          }
        }
      }
    })

    const playApp = new Vue({
      el: "#player-app",
      data() {
        return {
          audio: null,
          circleLeft: null,
          barWidth: null,
          duration: null,
          currentTime: null,
          isTimerPlaying: false,
          currentTrack: {
            name: "To The Moon",
            author: "HAYRUL",
            cover: "./assets/images/bg/ttm.jpg",
            source: "https://hayrul-nft.s3.amazonaws.com/Hayrul-Tothemoon.mp4"
          }
        };
      },
      methods: {
        play() {
          if (this.audio.paused) {
            this.audio.play();
            this.isTimerPlaying = true;
          } else {
            this.audio.pause();
            this.isTimerPlaying = false;
          }
        },
        generateTime() {
          let width = (100 / this.audio.duration) * this.audio.currentTime;
          this.barWidth = width + "%";
          this.circleLeft = width + "%";
          let durmin = Math.floor(this.audio.duration / 60);
          let dursec = Math.floor(this.audio.duration - durmin * 60);
          let curmin = Math.floor(this.audio.currentTime / 60);
          let cursec = Math.floor(this.audio.currentTime - curmin * 60);
          if (durmin < 10) {
            durmin = "0" + durmin;
          }
          if (dursec < 10) {
            dursec = "0" + dursec;
          }
          if (curmin < 10) {
            curmin = "0" + curmin;
          }
          if (cursec < 10) {
            cursec = "0" + cursec;
          }
          this.duration = durmin + ":" + dursec;
          this.currentTime = curmin + ":" + cursec;
        },
        updateBar(x) {
          let progress1 = this.$refs.progress1;
          let maxduration = this.audio.duration;
          let position = x - progress1.offsetLeft;
          let percentage = (100 * position) / progress1.offsetWidth;
          if (percentage > 100) {
            percentage = 100;
          }
          if (percentage < 0) {
            percentage = 0;
          }
          this.barWidth = percentage + "%";
          this.circleLeft = percentage + "%";
          this.audio.currentTime = (maxduration * percentage) / 100;
          this.audio.play();
        },
        clickprogress1(e) {
          this.isTimerPlaying = true;
          this.audio.pause();
          this.updateBar(e.pageX);
        },
        resetPlayer() {
          this.barWidth = 0;
          this.circleLeft = 0;
          this.audio.currentTime = 0;
          this.audio.src = this.currentTrack.source;
          setTimeout(() => {
            if (this.isTimerPlaying) {
              this.audio.play();
            } else {
              this.audio.pause();
            }
          }, 300);
        }
      },
      created() {
        let vm = this;
        this.audio = new Audio();
        this.audio.src = this.currentTrack.source;
        this.audio.ontimeupdate = function () {
          vm.generateTime();
        };
        this.audio.onloadedmetadata = function () {
          vm.generateTime();
        };
        this.audio.onended = function () {
          vm.audio.pause();
          vm.audio.currentTime = 0;
          vm.isTimerPlaying = false;
        };
      }
    })

  })()