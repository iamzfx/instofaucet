import fetch from "node-fetch";
import { SocksProxyAgent } from "socks-proxy-agent";
import * as dotenv from "dotenv";
import readline from "readline-sync";
import fs from "fs";
import delay from "delay"
dotenv.config()


const getIdCaptcha = (apiKey) => new Promise ((resolve, reject) => {
    fetch(`https://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=6LfbhPscAAAAAMZpUXhAmHhu1ChB6Xb9Ys7ciOYJ&pageurl=https://faucet.test.azero.dev&json=1`, {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'max-age=0',
          'priority': 'u=0, i',
          'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        }
      })
    .then(res => res.json())
    .then(res => resolve(res))
    .catch(err => reject(err))
});

const getResultCaptcha = (apiKey, id) => new Promise ((resolve, reject) =>  {
    fetch(`https://2captcha.com/res.php?key=${apiKey}&action=get&id=${id}&json=1`, {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'max-age=0',
          'priority': 'u=0, i',
          'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        }
      })
    .then(res => res.json())
    .then(res => resolve(res))
    .catch(err => reject(err))
});

const getFaucet = (proxy, address, captcha) => new Promise ((resolve, reject) => {
    fetch('https://faucet.test.azero.dev/drip', {
        method: 'POST',
        headers: {
          'Host': 'faucet.test.azero.dev',
          'Content-Length': '988',
          'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Sec-Ch-Ua-Mobile': '?0',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Origin': 'https://faucet.test.azero.dev',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          'Referer': 'https://faucet.test.azero.dev/',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
          'Priority': 'u=1, i',
          'Cookie': '_ga=GA1.2.1276673442.1723908116; _gid=GA1.2.357734183.1723908116; _ga_RYN8JBTMGH=GS1.2.1723908116.1.0.1723908116.0.0.0'
        },
        agent: proxy ? new SocksProxyAgent(proxy) : null,
        body: new URLSearchParams({
          'address': address,
          'g-recaptcha-response': captcha
        })
      })
    .then(async(res) => {
        resolve({
            code: res.status,
            data: await res.text()
        })
    })
    .catch(err => reject(err))
});


(async() => {
    const getFile = fs.readFileSync("./address.txt",'utf-8'); 
    const arrayFile = getFile.split(`\r\n`)
    const apiKey = process.env.APIKEY;
    console.log("========= Faucet Kinsto ==========");
    const pilihan = readline.question(`[!] With Proxy or Without ?\n[!] 1. With Proxy\n[!] 2. Without Proxy\n[!] : `);
    if(pilihan == 1){
        try{
            for(let address of arrayFile){
                let idCaptcha = '';
                do{
                    idCaptcha = await getIdCaptcha(apiKey)
                }while(idCaptcha.status == 0 || !idCaptcha)
                console.log("[!] Waiting for Captcha")
                let captcha = '';
                do{
                    captcha = await getResultCaptcha(apiKey, idCaptcha.request)
                }while(captcha.status == 0 || !captcha);
                console.log("[!] Captcha was Found!");
                const faucet = await getFaucet(proxy, address, captcha.request)
                if(faucet.code == 201){
                    console.log(`[!] Faucet for ${address} was Success!`)
                }else{
                    console.log(`[!] Faucet for ${address} was Unsuccessfull!`);
                    console.log(`[!] reason was ${faucet.data}`)
                }
                console.log("[!] Waiting for Delay 5 Seconds");
                await delay(5000);
            }
        }catch(error){
            console.log(error.toString())
        }     
    }else if (pilihan == 2) {
        try{
            for(let address of arrayFile){
                let idCaptcha = '';
                do{
                    idCaptcha = await getIdCaptcha(apiKey)
                }while(idCaptcha.status == 0 || !idCaptcha)
                console.log("[!] Waiting for Captcha")
                let captcha = '';
                do{
                    captcha = await getResultCaptcha(apiKey, idCaptcha.request)
                }while(captcha.status == 0 || !captcha);
                console.log("[!] Captcha was Found!");
                const faucet = await getFaucet(null, address, captcha.request)
                if(faucet.code == 201){
                    console.log(`[!] Faucet for ${address} was Success!`)
                }else{
                    console.log(`[!] Faucet for ${address} was Unsuccessfull!`);
                    console.log(`[!] reason was ${faucet.data}`)
                }
                console.log("[!] Waiting for Delay 5 Seconds");
                await delay(5000);
            }
        }catch(error){
            console.log(error.toString())
        }   
    }
})();