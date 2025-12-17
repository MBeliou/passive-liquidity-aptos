use clap::{Parser, Subcommand};


#[derive(Parser)]
#[command(name="scraper")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands
}

#[derive(Subcommand)]
pub enum Commands {
    Pools,
    Pool {id: String},
    Tokens
}

#[allow(async_fn_in_trait)]
pub trait Scraper {
    async fn scrape_pools(&self) -> anyhow::Result<()>;
    async fn scrape_pool(&self, id: &str) -> anyhow::Result<()>;
    async fn scrape_tokens(&self) -> anyhow::Result<()>;
}

pub async fn run<S: Scraper>(scraper: S) {
    let cli = Cli::parse();
    
    let result = match cli.command {
        Commands::Pools => scraper.scrape_pools().await,
        Commands::Pool { id } => scraper.scrape_pool(&id).await,
        Commands::Tokens => scraper.scrape_tokens().await,
    };

    if let Err(e) = result {
        eprintln!("Error: {e}");
        std::process::exit(1);
    }
}
