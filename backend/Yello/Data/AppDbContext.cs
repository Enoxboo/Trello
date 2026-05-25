using Microsoft.EntityFrameworkCore;
using Yello.Entities;

namespace Yello.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Board> Boards { get; set; }
    public DbSet<BoardList> Lists { get; set; }
    public DbSet<Card> Cards { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Label> Labels { get; set; }
    public DbSet<BoardMember> BoardMembers { get; set; }
    public DbSet<CardMember> CardMembers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // BoardList -> table "Lists" (le nom de classe BoardList évite le conflit avec List<T>)
        modelBuilder.Entity<BoardList>().ToTable("Lists");

        // Clés composites pour les tables de jointure many-to-many
        modelBuilder.Entity<BoardMember>().HasKey(bm => new { bm.BoardId, bm.UserId });
        modelBuilder.Entity<CardMember>().HasKey(cm => new { cm.CardId, cm.UserId });

        // Board -> Owner : Restrict pour éviter la suppression en cascade de l'utilisateur
        // qui supprimerait tous ses boards sans contrôle
        modelBuilder.Entity<Board>()
            .HasOne(b => b.Owner)
            .WithMany(u => u.OwnedBoards)
            .HasForeignKey(b => b.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Board supprimé -> ses listes sont supprimées automatiquement
        modelBuilder.Entity<BoardList>()
            .HasOne(l => l.Board)
            .WithMany(b => b.Lists)
            .HasForeignKey(l => l.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        // Liste supprimée -> ses cartes sont supprimées automatiquement
        modelBuilder.Entity<Card>()
            .HasOne(c => c.List)
            .WithMany(l => l.Cards)
            .HasForeignKey(c => c.ListId)
            .OnDelete(DeleteBehavior.Cascade);

        // Carte supprimée -> ses commentaires et labels sont supprimés
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Card)
            .WithMany(c => c.Comments)
            .HasForeignKey(c => c.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Label>()
            .HasOne(l => l.Card)
            .WithMany(c => c.Labels)
            .HasForeignKey(l => l.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        // Author d'un commentaire : Restrict pour ne pas supprimer les commentaires si l'auteur est supprimé
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // BoardMember : Board supprimé -> membres retirés / User supprimé -> pas de cascade board
        modelBuilder.Entity<BoardMember>()
            .HasOne(bm => bm.Board)
            .WithMany(b => b.Members)
            .HasForeignKey(bm => bm.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BoardMember>()
            .HasOne(bm => bm.User)
            .WithMany(u => u.BoardMemberships)
            .HasForeignKey(bm => bm.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // CardMember : Carte supprimée -> assignations supprimées
        modelBuilder.Entity<CardMember>()
            .HasOne(cm => cm.Card)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CardMember>()
            .HasOne(cm => cm.User)
            .WithMany(u => u.CardMemberships)
            .HasForeignKey(cm => cm.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
