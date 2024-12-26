class GameRoom {
  constructor(
    id,
    player1_id,
    player2_id,
    winner_id,
    status,
    israndom,
    code,
    create_at,
    update_at
  ) {
    this.id = id;
    this.status = status;
    this.player1_id = player1_id;
    this.player2_id = player2_id;
    this.winner_id = winner_id;
    this.create_at = create_at;
    this.update_at = update_at;
    this.israndom = israndom;
    this.code = code;
  }

  getWinner() {
    return this.winner_id
      ? `Winner is Player ${this.winner_id}`
      : "No winner yet";
  }
}
