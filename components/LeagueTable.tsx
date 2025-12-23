
import React from 'react';
import { Team } from '../types';

interface LeagueTableProps {
  teams: Team[];
}

const LeagueTable: React.FC<LeagueTableProps> = ({ teams }) => {
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-xl border border-white/10">
      <table className="w-full text-right">
        <thead className="bg-white/10 text-white/70">
          <tr>
            <th className="px-6 py-4">المركز | 排名</th>
            <th className="px-6 py-4">الفريق | 球队</th>
            <th className="px-6 py-4 text-center">لعب | 赛</th>
            <th className="px-6 py-4 text-center">فوز | 胜</th>
            <th className="px-6 py-4 text-center">تعادل | 平</th>
            <th className="px-6 py-4 text-center">خسارة | 负</th>
            <th className="px-6 py-4 text-center font-bold">نقاط | 积分</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedTeams.map((team, index) => (
            <tr key={team.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-bold">{index + 1}</td>
              <td className="px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">{team.logo}</span>
                <span className="font-bold">{team.name}</span>
              </td>
              <td className="px-6 py-4 text-center opacity-70">{team.played}</td>
              <td className="px-6 py-4 text-center opacity-70 text-green-400">{team.won}</td>
              <td className="px-6 py-4 text-center opacity-70">{team.drawn}</td>
              <td className="px-6 py-4 text-center opacity-70 text-red-400">{team.lost}</td>
              <td className="px-6 py-4 text-center font-black text-xl text-yellow-500">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeagueTable;
