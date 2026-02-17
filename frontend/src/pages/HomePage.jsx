import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, Users, Zap, GripVertical, Shield, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/shared/theme-toggle";
import LoadingTemplate from "@/components/shared/loading-template";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

const features = [
  { icon: LayoutDashboard, title: "Kanban Boards", desc: "Organize tasks visually with drag-and-drop columns and cards." },
  { icon: Users, title: "Team Workspaces", desc: "Create shared workspaces, invite members, and collaborate in real time." },
  { icon: GripVertical, title: "Drag & Drop", desc: "Move tasks between lists with smooth, intuitive drag-and-drop." },
  { icon: Zap, title: "Real-Time Sync", desc: "See changes instantly via WebSocket-powered live updates." },
  { icon: Activity, title: "Activity History", desc: "Track every action with a detailed, paginated activity feed." },
  { icon: Shield, title: "Secure Auth", desc: "JWT-based authentication with secure sessions and role management." },
];

function FloatingCard({ className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`absolute rounded-xl border-2 border-primary/15 bg-gradient-to-br from-accent/10 to-primary/6 backdrop-blur-sm shadow-xl opacity-40 dark:opacity-35 ${className}`}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent" />
          <div className="h-2 w-16 rounded-full bg-primary/40" />
        </div>
        <div className="h-2 w-24 rounded-full bg-accent/30" />
        <div className="h-2 w-12 rounded-full bg-primary/20" />
        <div className="flex gap-1 mt-2">
          <div className="h-1.5 flex-1 rounded-full bg-primary/30" />
          <div className="h-1.5 flex-1 rounded-full bg-accent/30" />
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-background overflow-hidden"
    >
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">TaskFlow</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Floating cards background */}
          <FloatingCard className="top-20 left-0 w-40 h-32" delay={0} />
          <FloatingCard className="top-40 right-10 w-48 h-40" delay={0.2} />
          <FloatingCard className="bottom-20 left-1/4 w-32 h-28" delay={0.4} />

          <motion.div className="text-center relative z-10" variants={stagger} initial="hidden" animate="show">
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Real-Time Task{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Collaboration
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              A lightweight Trello/Notion hybrid. Organize workflows with Kanban boards, real-time collaboration, and
              instant updates via WebSockets. Built for teams who want power without the complexity.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Try For Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary/30">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-card/30 to-secondary/20 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Why TaskFlow?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for seamless team collaboration, all in one intuitive platform.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-card border-2 border-border/40 p-8 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to streamline your workflow?</h2>
          <p className="text-muted-foreground mb-8">
            Join teams using TaskFlow to manage projects more effectively.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Demo Loading Template Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-secondary/20 to-card/30 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">See TaskFlow in Action</h2>
            <p className="text-muted-foreground">
              Experience the smooth, intuitive interface with our loading preview
            </p>
          </motion.div>
          
          <motion.div
            className="bg-card border-2 border-primary/30 rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <LoadingTemplate />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}
