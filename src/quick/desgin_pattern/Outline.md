# 设计模式

## 基础题

### 设计模式的原则

开闭原则（Open Closed Principle，OCP）
单一职责原则（Single Responsibility Principle, SRP）
里氏代换原则（Liskov Substitution Principle，LSP）
依赖倒转原则（Dependency Inversion Principle，DIP）
接口隔离原则（Interface Segregation Principle，ISP）
合成/聚合复用原则（Composite/Aggregate Reuse Principle，CARP）


电脑在以前维修的话是根本不可能的事，可是现在却特别容易，比如说内存坏了，买个内存条，硬盘坏了，买个硬盘换上。为啥这么方便？从修电脑里面就有面相对象的几大设计原则，

比如单一职责原则，内存坏了，不应该成为更换CPU的理由，它们各自的职责是明确的。

再比如开放－封闭原则，内存不够只要插槽足够就可以添加。

还有依赖倒转原则，原话解释是抽象不应该依赖细节，细节应该依赖于抽象，说白了，就是要针对接口编程，不要对实现编程，无论主板，CPU，内存，硬盘都是针对接口设计的，如果是针对实现来设计，内存就要对应的某个品牌的主板，那就会出现换内存需要把主板也换了的尴尬。