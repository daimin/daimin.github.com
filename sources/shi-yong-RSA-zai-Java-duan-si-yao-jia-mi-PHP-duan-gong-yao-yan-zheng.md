title:使用RSA在Java端私钥加密，PHP端公钥验证

tags:java,php,rsa

date:2013-11-23

工作需要研究下RSA加密解密算法，一不小心差点把自己搞疯了，主要是我们服务器是PHP，而客户端肯定以后是Java了。所以我需要的是在Java端用私钥加密，而服务器用公钥进行验证。在这两端进行RSA加密解密需要严格的要求，这里我主要做一下记录。

**首先是Java端：**   
  
1. 使用的是javax.crypto.Cipher库，一般来说最好使用这个库，因为Android里面也带有这个库，而且使用起来比较方便。

2. 生成私钥公钥对

        KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");     
        //密钥位数     
        keyPairGen.initialize(1024);     
        //密钥对     
        KeyPair keyPair = keyPairGen.generateKeyPair();     
      
        // 公钥     
        PublicKey publicKey = (RSAPublicKey) keyPair.getPublic();     
      
        // 私钥     
        PrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate(); 

3. 获取私钥，使用PKCS8EncodedKeySpec来生成，Base64库最好使用org.apache.commons.codec4

        byte[] keyBytes;     
        keyBytes = Base64.decodeBase64(key);  
      
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);   
            
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");     
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);     

4. 这里需要注意的是获取instance的时候必须是**RSA/ECB/PKCS1Padding**，否则php是不支持pkcs8的。


        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.DECRYPT_MODE, ppkey); 

5. **RSA/ECB/PKCS1Padding**好像加密的时候，好像不能一次性对超过117个字节的数据加密，可以做如下的处理：

        byte[] enBytes = null;
        int i = 0;
        for (i = 0; i < ptext.length; i += 64) {  
              // 注意要使用2的倍数，否则会出现加密后的内容再解密时为乱码
              byte[] doFinal = cipher.doFinal(ArrayUtils.subarray(ptext, i,i + 64));  
              enBytes = ArrayUtils.addAll(enBytes, doFinal);  
        }
        return enBytes;

6. 需要注意的是这里加密的话，最好对原文进行MD5之后，在加密，那么在PHP端，进行验证的时候，只要验证原文的MD5值就行了，因为PHP的openssl对于比较长的字符串，好像并不能进行处理，Java没有此问题。**就是这里困了我好久**。

**服务器PHP端**


1. 保存公钥，放到文件中，还是数据库中随便，不过需要注意的是Java中的公钥、私钥只有字符串就OK，但是PHP中的是有指定格式的，必须这样：

        -----BEGIN PUBLIC KEY-----
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFtYP+8zOR2WPJe/0c0w3kf3vmzcDksDPFgaqI
        psR+587tPm5YgZc53ii90wXsmjwVedU8yM8aZYpg7ZZALAximTR/JnK3A/+ffQG7lmNM0zC9StsD
        S3rD9bNIj0jGHUBT5Dxf98+TnEojWECeg5ZibZ51xzN8tChqB7MmApBIGwIDAQAB
        -----END PUBLIC KEY-----

     可以通过下面的函数处理：

        private function setupPubKey($pubkey) {
            if (is_resource ( $pubKey )) {
                return true;
            }
			
            $pem = chunk_split($pubkey,64,"\n");
            $pem = "-----BEGIN PUBLIC KEY-----\n".$pem."-----END PUBLIC KEY-----\n";
            $pubkey = openssl_pkey_get_public ( $pem );
            return $pubkey;
        }

2. 需要注意的是，这里验证的是原文的md5值，这样：
  
        $result = (bool)openssl_verfify(md5($plainText),base64_decode($sign), OPENSSL_ALGO_DSS1);

    必须使用OPENSSL_ALGO_DSS1，我也不知道为什么，估计是和**RSA/ECB/PKCS1Padding**对应，
    不过在使用alipay或者     wandoujia进行签名验证的时候，可能不需要这个参数，请酌情增、删。

> 这个东西话费了我很多时间才调通，差点放弃，语言间对于RSA的实现会有所不同，描述也会有所不同。






 