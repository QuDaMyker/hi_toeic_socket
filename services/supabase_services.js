import TableNameConstant from "../data/constant/table_name_constant.js";
const { GAME_ROOM, GAME_WORDS, WORD_EN_V2 } = TableNameConstant;
import { createClient } from "@supabase/supabase-js";

class SupabaseServices {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  _handleError(error) {
    console.error("Error SupabaseServices", error);
    return null;
  }

  async insertGameRoom(gameroom) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .insert({
          status: gameroom.status,
          player1_id: gameroom.player1_id,
          winner_id: gameroom.winner_id,
          israndom: gameroom.israndom,
          created_at: new Date(),
          updated_at: null,
          code: gameroom.code,
        })
        .select();

      if (error) {
        this._handleError(error);
      } else {
        console.log("GameRoom inserted successfully!");
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async updateGameRoom(id, value) {
    try {
      console.log(value);

      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .update(value)
        .eq("id", id)
        .select();

      if (error) {
        this._handleError(error);
      } else {
        console.log("GameRoom udpated successfully!");
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async deleteGameRoom(id) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .delete()
        .eq("id", id);

      if (error) {
        this._handleError(error.message);
      } else {
        console.log("GameRoom deleted successfully!");
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async getGameRoomById(id) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .select()
        .eq("id", id);

      if (error) {
        this._handleError(error.message);
      } else {
        console.log(data);

        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async getGameRoomFree(userId) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .select()
        .neq("player1_id", userId)
        .eq("status", "waiting");

      if (error) {
        this._handleError(error.message);
      } else {
        console.log("GameRoom retrieved successfully!");
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async getGameRoomByPassword(password) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .select()
        .eq("code", password)
        .eq("status", "waiting");

      if (error) {
        this._handleError(error.message);
      } else {
        console.log("GameRoom retrieved successfully!");
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async insertGameWords(word) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_WORDS)
        .insert(word)
        .select();

      if (error) {
        this._handleError(error.message);
      } else {
        console.log("GameRoom retrieved successfully!");
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async checkValidWord(word) {
    try {
      const { data, error } = await this.supabase
        .from(WORD_EN_V2)
        .select()
        .eq("word", word);

      if (error) {
        this._handleError(error.message);
      } else {
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async getLastWordInRoom(roomId) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_WORDS)
        .select()
        .eq("room_id", roomId)
        .eq("valid", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        this._handleError(error.message);
      } else {
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  async getRoomPlayers(roomId) {
    try {
      const { data, error } = await this.supabase
        .from(GAME_ROOM)
        .select("player1_id, player2_id")
        .eq("id", roomId);

      if (error) {
        this._handleError(error.message);
      } else {
        return data;
      }
    } catch (e) {
      this._handleError(e.message);
    }
  }

  generateRandomSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

export default SupabaseServices;
