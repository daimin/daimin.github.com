title:API接口安全性设计

tags:安全

date:2020-05-21

1. 令牌token授权（或者是AppId）。验证通过后返回一个token（可以是一个uuid，保证唯一就行了），token存放在服务器中（可以存储在redis中），客户端的请求必须带上token，如果token不存在就说明请求无效。  
内部系统或者安全要求比较低的系统可以用这个方式，性能很好。

2. 时间戳t。验证通过后的请求带上当前时间戳，可以设置时间戳失效时间，当前时间减去时间戳如果大于了失效时间，就说明请求失效了。  
能防止恶意请求攻击服务器；也能防止因为客户端的bug导致的无效请求。

3. 签名sign。token或AppId加上当前时间戳t，再加上其他业务参数，可以按照指定的顺序排序后序列化为一个字符串s，然后双方约定一个盐值k作为密钥，通过md5(s + k)得到签名。客户端请求带上sign及其他参数，服务端进行签名验证，如果不一致就返回不成功，否则允许请求或修改数据。
    * 因为得不到密钥，所以生成的签名将无法通过验证。
    * 不知道签名的规则和参与签名的字段，也无法生成正确的签名，所以保证了请求的合法性。
    * 因为请求参数也参与了签名，所以如果篡改了请求数据，也会导致签名验证失败。

4. 非对称加密RSA。客户端生成密钥对，公钥提供给服务端。

    * 客户端将内容用私钥加密后提交给服务端，服务端用公钥解密
    * 服务端将返回数据用公钥加密后返回给客户端，客户端拿到后用私钥解密。
  只要密钥对不泄密，基本是不会有安全问题。

5. 对称加密DES（DES已经被破解，不推荐使用）和AES。这个只有一个密钥，客户端和服务端都用这个密钥加解密。只要密钥不丢失，也是比较安全的。

6. 限流机制。通过token或者appId进行限流，常用的[限流算法有计数器法、滑动窗口、令牌桶和漏桶算法](http://daimin.github.io/posts/%E5%B8%B8%E7%94%A8%E7%9A%84%E9%99%90%E6%B5%81%E7%AE%97%E6%B3%95.html)。

7. 黑名单机制。 限制指定的token或者appId访问系统。因为拥有这些token或者appId的客户端可能不受信任或者临时要限制其访问。

8. 数据合法性校验。xss，csrf，sql注入等内容的过滤或者防御。还有一些业务相关的数据的校验，比如电话号码长度、email格式，身份证长度和格式等。

9. oauth方式。oauth是开放授权的一个标准，允许用户授权B应用不提供帐号密码的方式去访问该用户在A应用服务器上的某些特定资源。现在一般都用oauth2.0。

      ![](/image/QQ20200524230341.png)

    * oauth不会暴露用户账号和密码给第三方服务
    * 第三方服务的域名也必须是在授权服务中注册认证过的
    * authorize code 只能使用一次，多次使用会导致acess_token失效。
    * secret 不能泄露。这个第三方服务请求，不暴露给外部。
    * state参数在授权的同时由请求方生成，回调和申请令牌中都要带上该参数，防止csrf请求。

>综上的各种措施，可以根据接口的安全要求来组合使用。一般来讲非对称加密是最安全的，但是需要用令牌授权、时间戳来限制非正常请求。因为哪怕是授权的客户端，也有可能会有不合理的请求，我们设计API的时候，应该考虑控制或拒绝这些请求。




