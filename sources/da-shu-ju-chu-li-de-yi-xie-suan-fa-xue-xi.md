title:大数据处理的一些算法学习

tags:trie,bloomfilter,算法

date:2014-12-30

1. 倒排索引
一般的索引都是通过在内容中提取关键词作为索引，索引文件记录每个文章中出现的关键词，查询的时候根据搜索内容去查询每个文档的关键词，来确定是否为所需文档，然后合并查询结果。（以文档为中心）

     倒排索引是通过关键词去存储相关的文档地址和频度(出现次数)，通过搜索词分词去查询关键字，然后得到关键词对应的文档地址。由于不是由记录来确定属性值，而是由属性值来确定记录的位置，因而称为倒排索引(inverted index)。（以关键词为中心）

2. bloomfilter

     两个不同url通过同一个hash可能得到相同的值(hash碰撞)
特性：bloomfilter不存在的肯定不存在，bloomfilter中存在的可能判断为不存在。不会漏，只会错
主要就是两个函数，求bitarray的大小的：m = ceil((n * ln(p)) / ln(1.0 / (pow(2.0, ln(2.0)))))；求hash函数的个数：k=(ln2)*(m/n)  
bloomfilter 可以看做是bitmap的扩展。  
bitmap一般采用bit位置表示值，而1或0表示是否存在该值

3. 外排序
     1. 外排序其实就是内存不够用的时候，在外存储器（一般是硬盘）暂时存储排序数据的方式。
     2. 比如有一个文件很大，需要对其中的数据进行排序，而其容量大概是内存的10倍，这样

4. trie树
     1. 将词语的每个字符作为节点构建树，算法十分简单
     2. 从root开始到叶子节点的路径，每一条都是一个词语
     3. 时间复杂度大概是O(N)，由于公共前缀会使用相同的路径，所以也节省了大量的空间，如果词语存在的公共前缀越多会越省空间（持久化的时候会比原文件小很多）。
但是由于每一个字符都会使用一个节点，对应一个变量空间，所以对于直接存储字符串，会浪费更多内存。支持字符集的N次方(N为词语长度)
     4. 我这里python版本的，使用dict嵌套完成，并不会存在以上的字符集N次方的问题，dict自动增长，默认支持所有的字符集，一般来讲会比原词语集占内存较少，只是保存dict结构需要浪费额外的内存。

5. 双层桶划分
     1. 其实就是一种思想，就是当数据量过大，内存处理不过来时，将数据分割成内存可以处理的大小，然后分步处理，可以经过多次划分处理，直到内存可以合并最后的处理数据。
     2. 其实可以知外排序也是双层桶划分的一种体现。
     
