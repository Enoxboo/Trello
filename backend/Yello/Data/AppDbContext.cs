using Microsoft.EntityFrameworkCore;
using Yello.Entities;

namespace Yello.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<List> Lists => Set<List>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<List>()
            .HasOne(l => l.Board)
            .WithMany(b => b.Lists)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Card>()
            .HasOne(c => c.List)
            .WithMany(l => l.Cards)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Card)
            .WithMany(ca => ca.Comments)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Label>()
            .HasOne(l => l.Card)
            .WithMany(c => c.Labels)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
