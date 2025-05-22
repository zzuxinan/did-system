import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">去中心化身份认证系统</h1>
        <p className="text-xl text-muted-foreground">
          基于区块链技术的安全、可信、自主的身份认证解决方案
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">立即注册</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">登录系统</Button>
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>安全可信</CardTitle>
            <CardDescription>基于密码学原理，确保身份信息的安全性和不可篡改性</CardDescription>
          </CardHeader>
          <CardContent>
            <p>使用非对称加密技术，保护用户隐私和数据安全</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>自主可控</CardTitle>
            <CardDescription>用户完全掌握自己的身份信息，无需依赖第三方</CardDescription>
          </CardHeader>
          <CardContent>
            <p>通过智能合约实现身份认证的自动化，降低信任成本</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>便捷高效</CardTitle>
            <CardDescription>简化身份验证流程，提高用户体验</CardDescription>
          </CardHeader>
          <CardContent>
            <p>支持多种认证方式，满足不同场景需求</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">主要功能</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>身份认证</CardTitle>
              <CardDescription>基于DID的去中心化身份认证</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>DID身份创建与管理</li>
                <li>身份信息验证</li>
                <li>身份状态查询</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据授权</CardTitle>
              <CardDescription>安全可控的数据共享机制</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>细粒度的数据授权</li>
                <li>授权记录追踪</li>
                <li>授权状态管理</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>声明管理</CardTitle>
              <CardDescription>可验证声明的创建与验证</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>声明创建与签发</li>
                <li>声明验证</li>
                <li>声明历史记录</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>安全审计</CardTitle>
              <CardDescription>完整的操作日志与审计追踪</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>操作日志记录</li>
                <li>安全事件追踪</li>
                <li>异常行为监控</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold">开始使用</h2>
        <p className="text-muted-foreground">
          立即体验去中心化身份认证系统，开启安全可信的数字身份之旅
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">免费注册</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">立即登录</Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 